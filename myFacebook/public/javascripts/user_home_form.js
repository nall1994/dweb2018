$(() => {
    $('#postType').change(e => {
        e.preventDefault()
        if($('#receitaForm').is(':visible')) $('#receitaForm').css('display','none')
        if($('#ideiaForm').is(':visible')) $('#ideiaForm').css('display','none')
        if($('#desportivoForm').is(':visible')) $('#desportivoForm').css('display','none')
        $('#' + $('#postType').val() + "Form").css('display','block')
    })
})