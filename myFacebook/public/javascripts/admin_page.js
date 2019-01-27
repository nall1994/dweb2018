$(() => {
    $('#importar').click(e => {
        e.preventDefault()
        var dataToImport = $("input[name='escolhaImport']:checked").val()
        var formData = new FormData()
        if($('#ficheiroDados').val() == '' || dataToImport == undefined) {
            alert('Tem que escolher o tipo de dados que quer importar bem como o ficheiro de dados!')
        } else {
            formData.set('data_type',dataToImport)
            formData.set('import_file', $('#ficheiroDados')[0].files[0])
            $.ajax({
                type:"POST",
                enctype: "form/multipart",
                processData: false,
                contentType: false,
                url : "http://localhost:3000/users/admin/import",
                data : formData,    
                success : f => {
                    alert(f)
                    window.location.reload(true)
                },
                error : e => {
                    alert('Erro no post: ' + JSON.stringify(e))
                    console.log("Erro no post: " +e)
                }        
            })
        }      
        
            
    })

    $('#exportar').click(e => {
        e.preventDefault()
        var dataToExport = $("input[name='escolhaExport']:checked").val()
        if(dataToExport == undefined) {
            alert('Tem que escolher o tipo de dados que quer exportar!')
        } else {
            var body = new Object()
            body.data_type = dataToExport
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/users/admin/export",
                data: JSON.stringify(body), 
                contentType: "application/json; charset=utf-8",
                success: msg => {
                    alert(msg)
                    window.location.reload(true)
                },
                error: function(msg) {
                    alert('error:'+JSON.stringify(msg));
                }
            });
        }
        $('#' + dataToExport + 'Export').prop('checked',false)
        
    })
})