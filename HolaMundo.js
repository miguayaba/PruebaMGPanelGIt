   //Este es un cambio en el codigo
    listaDocumentos()

    function listaDocumentos(){

        if(localStorage.getItem('hashadmin')){
            var cuenta = localStorage.getItem('hashadmin')
        }else{
            var cuenta = localStorage.getItem('hash')
        }
    
        db.collection("documentos").where("cuenta", "==", cuenta)
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
            
                
                    
                    let tipoTemp = doc.data().tipo;
                    const tipo = tipoTemp.split("/");
                    console.log(tipo[0])
                    
                    if(tipo[0] == "image"){
                        var path = "<img src='" + doc.data().urlfull + "' width='100%'/>";
                    }else if(tipo[0] == "video"){
                        var path = `<video width="100%"  controls>
                                        <source src="${doc.data().urlfull}" type="video/mp4">
                                    </video>`
                    }else if(tipo[0] == "application"){
                        if(tipo[1] == "pdf"){
                            var path = "<img src='https://s3.us-east-2.amazonaws.com/mgpanel/icopdf-V8G.png' width='100%'/>"
                        }else{
                            var path = "<img src='https://s3.us-east-2.amazonaws.com/mgpanel/icodoc-FXy.png' width='100%'/>"
                        }
                    }else{
                        var path = "<img src='https://s3.us-east-2.amazonaws.com/mgpanel/icodoc-FXy.png' width='100%'/>"
                    }

                    if(doc.data().titulodoc){
                        var titulodoc = doc.data().titulodoc;
                    }else{
                        var titulodoc = "";
                    }


                    document.getElementById("documentoDes").innerHTML += ` 
                    <div class="col-6 col-md-4 col-lg-3 col-xl-2">
                        <div class="marcoDoc">
                            ${path}
                            <p class="infoDoc"><small class="text-white"><b>${titulodoc}</b><br><a href="${doc.data().urlfull}" target="_blank" ><span class="fe fe-eye"></span> Ver</a></small></p>

                        </div>
                    </div>
                    `;

                                    
                });

                console.log(querySnapshot.docs.length)

                if(querySnapshot.docs.length == 0){

                    document.getElementById("documentoDes").innerHTML = `

                    <div class="col-12">
                        <br><br>
                        <p style="text-align: center"><img src="https://s3.us-east-2.amazonaws.com/mgpanel/46-coworking.png" width="200" />
                        <h3 style="text-align: center">Aún no has cargado ningun documento...</h3>
                    </div>
                    
                    `;

                }

            
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
    
    }

    function subirArchivo(){

        $('.btncarga').hide();
        $('.btncargando').show();

        if($("#fileinput").val()==""){
            $('.btncarga').show();
            $('.btncargando').hide();
            swal.fire({
                icon: 'error',
                title: 'Debes agregar un archivo',
                showConfirmButton: false,
                timer: 1500
            })
            return false;
        }

        $('.progrefoto').show();

        if(localStorage.getItem('hashadmin')){
            var cuenta = localStorage.getItem('hashadmin')
        }else{
            var cuenta = localStorage.getItem('hash')
        }

        var random = Math.floor(Math.random()*9000000) + 100000;

        var myFile = $('#fileinput').prop('files');
        var file = myFile[0];
        var fileName = random + '-' + cuenta + '-' +myFile[0].name;
        var storageRef = firebase.storage().ref('archivos/' + fileName);
        var uploadTask = storageRef.put(file);
    
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, 
            (snapshot) => {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                //console.log('Upload is ' + progress + '% done');
                $('.progrefotobar').css('width',  progress +'%');
                    switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                    console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                    case 'storage/unauthorized':
                        console.log('User doesnt have permission to access the object');
                    // User doesn't have permission to access the object
                    break;
                    case 'storage/canceled':
                        console.log('User canceled the upload')
                    // User canceled the upload
                    break;
            
                    // ...
            
                    case 'storage/unknown':
                        console.log('Unknown error occurred')
                    // Unknown error occurred, inspect error.serverResponse
                    break;
                }
            },
            () => {
            // Upload completed successfully, now we can get the download URL
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {

                console.log(uploadTask.snapshot.metadata)

                //Data
                var tipo = uploadTask.snapshot.metadata.contentType;
                var urlfull = downloadURL;
                var name = uploadTask.snapshot.metadata.name;
                var size = uploadTask.snapshot.metadata.size;
                var timeCreated = uploadTask.snapshot.metadata.timeCreated;
                var type = uploadTask.snapshot.metadata.type;
                var updated = uploadTask.snapshot.metadata.updated;
                var titulodoc = $('#titulodoc').val();
                var folder = $('#folder').val();
                

        
                // if(tipo == 'application/pdf'){
                //     console.log('Es un PDF')
                // }else if((tipo == 'image/png')||(tipo == 'image/jpeg')){
                //     $('#fotodes').html(`
                //      <img src="${downloadURL}" width="250"/>
                //     `);
                // }else{
                //     console.log('Es un ' + tipo)
                // }
                
                $('#documentoDes').html('')
                listaDocumentos()

                $('.progrefoto').hide();
                $('.progrefotobar').css('width','0%');
                $('#fileinput').val('')
                $('#titulodoc').val('')
                $('#folder').val('')
                $('.btncarga').show();
                $('.btncargando').hide();

                /********* GUARDAR REGISTRO ***********/
          
                db.collection("documentos").add({
                    tipo,
                    urlfull,
                    name,
                    size,
                    timeCreated,
                    type,
                    updated,
                    titulodoc,
                    folder,
                    cuenta
                })
                .then((docRef) => {
                    console.log("Document written with ID: ", docRef.id);
                    Swal.fire({
                        //position: 'top-end',
                        icon: 'success',
                        title: 'Guardado con éxito',
                        showConfirmButton: false,
                        timer: 1500
                    })
                   // location.reload();
                })
                .catch((error) => {
                    console.error("Error adding document: ", error);
                });
 
            });
            }
        );


    }

    function verFoto(){

        var storaRef = firebase.storage().ref('archivos/batch_IMG_2017.jpg');

        storaRef.getDownloadURL()
        .then((url) => {
        console.log(url)
            $('#fotodes').html(`
            <img src="${url}" width="250"/>
            `);
        })
        .catch((error) => {
            switch (error.code) {
                case 'storage/object-not-found':
                console.log('No existe archivo');
                break;
                case 'storage/unauthorized':
                console.log('No tienes autorizacion');
                break;
                case 'storage/canceled':
                console.log('Descarga cancelada');
                break;
                case 'storage/unknown':
                console.log('Error en el servidor');
                break;
            }
            });

    }

    function verArchivo(){

        var storaRef = firebase.storage().ref('archivos/eloychacon_compressed.pdf');

        storaRef.getDownloadURL()
        .then((url) => {
        console.log(url)

            $('#documentoDes').html(`
            <a href="${url}" target="_blank"/> Descargar Documentos</a>
            `);

        })
        .catch((error) => {
        switch (error.code) {
            case 'storage/object-not-found':
            console.log('No existe archivo');
            break;
            case 'storage/unauthorized':
            console.log('No tienes autorizacion');
            break;
            case 'storage/canceled':
            console.log('Descarga cancelada');
            break;
            case 'storage/unknown':
            console.log('Error en el servidor');
            break;
        }
        });

    }