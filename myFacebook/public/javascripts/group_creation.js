$(() => {
    $('#criarGrupo').click(e => {
        e.preventDefault();
        var form = document.getElementById('groupCreationForm');
        var groupForm = new FormData(form);
        if (validateNewGroup(groupForm)) {
            var group = new FormData();
            group.set('nome', groupForm.get('nome'));
            group.set('desc', groupForm.get('desc'));
            group.set('admin', $('#useremail').val())
            if ($('membros').val() != '') {
                group.set('membros', groupForm.get('membros'));
            }
            if ($('#foto').val() != '') {
                group.set('foto', $('#foto')[0].files[0]);
            }
            $.ajax({
                type: "POST",
                enctype: "form/multipart",
                processData: false,
                contentType: false,
                url: "http://localhost:3000/groups/new",
                data: group,
                success: msg => {
                    alert("Grupo registado com sucesso.");
                    window.location.reload(true);
                },
                error: function (msg) {
                    alert("Erro no registo do grupo.");
                }
            })
            // Append do evento à lista de eventos abaixo.
        }
    })
})

function validateNewGroup(formData) {
    if (formData.get('nome') == '') {
        $('#appendedData').remove();
        $('#groupCreationForm').prepend('<p id="appendedData" class="w3-center w3-text-red">É obrigatório especificar um nome para o grupo.</p>');
        return false;
    }
    if (formData.get('desc') == '') {
        $('#appendedData').remove();
        $('#groupCreationForm').prepend('<p id="appendedData" class="w3-center w3-text-red">É obrigatório especificar uma descrição para o grupo.</p>');
        return false;
    }
    return true;
}