// functions of search input
function searchInput() {
    let query = $("#searchInput").val();
    // form params
    let params = { 
        q: query,
        'x-api-key': '53Qj6B8jah1fXvfohvwiW5m2595oDTfN9w12KLvE'
    };
    apigClient
        .searchGet(params, {}, {})
        .then(response => {
            //This is where you would put a success callback
            console.log('Text input success!!');
            console.log('Response =', response);

            $("#pictureBox").empty();
            // 这里写showImage的函数
            let img_list = response.data
            if(img_list === "No such photos.") {
                alert("No such photos!!")
                return
            }
            for (let img_url of img_list) {
                let result_img = $(`<div class="pictureItem"><img src=${img_url} alt="picture"></div>`);
                $("#pictureBox").append(result_img);
            }
        })
        .catch(error => {
            //This is where you would put an error callback
            console.log('Text input failed!!');
            console.log('Response =', error);
        });
}

/*******************
    send voice to s3 bucket and then request lambda function to parse the voice into text 
    and finally apply lf again to search the parsed text
*******************/
function sendData(data) {
    let config = {
        headers: {
            'Content-Type': data.type
        }
    };

    // language of uploading something to s3.
    let url = 'https://8ixyj7ee3j.execute-api.us-east-1.amazonaws.com/v1/upload/voice.b3.6998.hw2/userVoice.mp3';
    axios
        .put(url, data, config)
        .then(response => {
            // console.log(response.data)
            console.log("Upload voice to s3 successful!!");
            params = { 
                q: "voiceSearch",
                'x-api-key': '53Qj6B8jah1fXvfohvwiW5m2595oDTfN9w12KLvE'
            };
            // upload voice to lambda function to be parsed into text
            apigClient
                .searchGet(params, {}, {})
                .then(response => {
                    console.log('Voice input success!!');
                    console.log('Response =', response);
                })
                .catch(error => {
                    console.log('Voice input failed!!');
                    console.log('Response =', error);
                });
            // wait 120s for the uplaod and transcribe process
            setTimeout(function() {
                params = { q: "voiceResult" };
                apigClient
                    .searchGet(params, {}, {})
                    .then(response => {
                        console.log('Voice search success!!');
                        console.log('Response =', response);
                        // 这里写showImage的函数
                        // let img_list = response.data
                        // if(img_list === "No such photos.") {
                        //     alert("No such photos in getting pictures from voice!!");
                        //     return;
                        // }
                        // for (var i = 0; i < img_list.length; i++) {
                        //     img_url = img_list[i];
                        //     new_img = document.createElement('img');
                        //     new_img.src = img_url;
                        //     document.body.appendChild(new_img);
                        // }
                    })
                    .catch(error => {
                        console.log(error);
                        alert("Something error in getting pictures from voice");
                    });
            }, 120000);
        })
        .catch(error => {
            console.log("Something error in uploading voice to s3 bucket: [ voice.b3.6998.hw2 ]");
            console.log(error);
        })
}

function getObjectURL(file) {
    var url = null;
    if (window.createObjectURL != undefined) { // basic
        url = window.createObjectURL(file);
    } else if (window.URL != undefined) { // mozila(firefox)
        url = window.URL.createObjectURL(file);
    } else if (window.webkitURL != undefined) { // webkit or chrome
        url = window.webkitURL.createObjectURL(file);
    }
    return url;
}

function startRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    const status = $(".recordingHint");
    // const SpeechRecognition = window.webkitSpeechRecognition;

    let recognition = new SpeechRecognition();
    console.log(recognition)

    recognition.onstart = () => {
        console.log('开始讲话了');
        status.empty();
        status.append(`Listening&nbsp;<i class="fas fa-spinner fa-pulse"></i>`);
    };

    recognition.onspeechend = () => {
        status.empty();
        status.append(`Listening stops.`);
        setTimeout(function() {
            $("#recordingInterface").addClass('close');
            $("#bottomInterface").removeClass('blur');
        }, 500)
        recognition.stop();
    };

    recognition.onresult = (result) => {
        $("#searchInput").attr("value", result.results[0][0].transcript);
    }
    recognition.start();
};

// main
$(document).ready(function () {
    /************************ upload input control ************************/
    $('#alterUploadArea').click(function(){
        $('#uploadFileInput').click();
    });

    $(".uploadIcon").click(function() {
        $('#uploadFileInput').click();
    })

    $("#uploadFileInput").change(function(e) {
        let objUrl = getObjectURL(this.files[0]);
        let fileName = e.target.value.split('\\').pop();
        $("#selectedFileName").html(fileName);
        $("#uploadButton").css({"top": "40px", "left": "0"});
        $('#preImage').attr('src', objUrl);
        $(".labelInput").val('');
        $("#selectedFile").removeClass('close');
    })

    /************************ search input ************************/
    $("#searchInput").keyup(function(e) {
        if(e.keyCode === 13) {
            console.log('enter被按下，将要发送搜索请求');
            searchInput();
        }
    });
    
    /************************ recording audio ************************/
    // get rec package
    let rec = Recorder({
        bitRate: 32,
        sampleRate: 24000
    });
    // recording begins
    $("#startRecordingIcon").click(function() {
        // show recording interface
        console.log('录音按钮被按下');
        $("#bottomInterface").addClass('blur');
        $("#recordingInterface").removeClass('close');
        
        startRecognition();
        // rec.open(function() {
        //     rec.start();
        // }, function(msg, isUserNotAllow) {
        //     console.log((isUserNotAllow ? "UserNotAllow," : "") + "can't record:" + msg);
        // });
    })

    // recording terminates
    // $("#stopRecordingIcon").click(function() {
    //     // hide recording interface
    //     console.log('停止录音按钮被按下');
    //     $("#recordingInterface").addClass('close');
    //     $("#bottomInterface").removeClass('blur');

    //     rec.stop((blob, duration) => {

    //         rec.close();
    //         console.log('录音停止.')
    //         console.log(URL.createObjectURL(blob), "Duration:" + duration + "ms");
    //         console.log('blob =', blob);

    //         // preview records
    //         var audio = document.createElement("audio");
    //         audio.controls = true;
    //         document.body.appendChild(audio);
    //         audio.src = URL.createObjectURL(blob);
    //         // audio.play();

    //         console.log('将发送blob音频文件');
    //         sendData(blob);
    //     });
    // })

    $("#uploadButton").click(function(){
        let labelInput = $(".labelInput").val();
        console.log('label =', labelInput);
        if(!labelInput && !window.confirm("Are you sure you don't add a label?")) {
            return;
        }
        let label = labelInput;

        let files = $('#uploadFileInput')[0].files[0];
        let url = 'https://8ixyj7ee3j.execute-api.us-east-1.amazonaws.com/v1/upload/b2.6998.hw2/' + files.name;

        /****************************************** axios *********************************************/
        let config = {
            headers: {
                'Content-Type': files.type,
                'x-amz-meta-customLabels': label,
                // "x-api-key":"V3PD7IU9fo5emUn60jNIl3OQUJsbC2k75Lvl7tRK"
            }
        };
        
        axios
            .put(url, files, config)
            .then(response => {
                alert("Upload successful!!");
                $("#selectedFile").addClass('close');
            })
            .catch(error => {
                console.log('error =', error);
            })
    })
});