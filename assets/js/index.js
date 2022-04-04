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

// get the url link of uploaded image
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

// record voice and recognize to english
function startRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    const status = $(".recordingHint");
    // const SpeechRecognition = window.webkitSpeechRecognition;

    let recognition = new SpeechRecognition();
    console.log('recognition =', recognition)

    recognition.onstart = () => {
        console.log('start talking');
        status.empty();
        status.append(`Listening&nbsp;<i class="fas fa-spinner fa-pulse"></i>`);
    };

    recognition.onspeechend = () => {
        status.empty();
        status.append(`Listening stops.`);
        setTimeout(function() {
            $("#recordingInterface").addClass('close');
            $("#bottomInterface").removeClass('blur');
            $("#searchInput").focus();
        }, 500)
        recognition.stop();
    };

    recognition.onresult = (result) => {
        $("#searchInput").attr({"value": result.results[0][0].transcript});
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
    // recording begins
    $("#startRecordingIcon").click(function() {
        // show recording interface
        console.log('录音按钮被按下');
        $("#bottomInterface").addClass('blur');
        $("#recordingInterface").removeClass('close');
        
        startRecognition();
    })

    /************************ upload picture ************************/
    $("#uploadButton").click(function(){
        let labelInput = $(".labelInput").val();
        console.log('label =', labelInput);
        if(!labelInput && !window.confirm("Are you sure you don't add a label?")) {
            return;
        }
        let label = labelInput;

        let files = $('#uploadFileInput')[0].files[0];
        let url = 'https://8ixyj7ee3j.execute-api.us-east-1.amazonaws.com/v1/upload/b2.6998.hw2/' + files.name;

        /********************************* using axios *************************************/
        let config = {
            headers: {
                'Content-Type': files.type,
                'x-amz-meta-customLabels': label
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