$(document).ready(function () {
    $('#movie-form').submit(function (event) {
        event.preventDefault();

        const formData = {
            nom: $('#nom').val(),
            dateDeSortie: $('#dateDeSortie').val(),
            realisateur: $('#realisateur').val(),
            note: parseFloat($('#note').val()),
            notePublic: parseFloat($('#notePublic').val()),
            compagnie: $('#compagnie').val(),
            description: $('#description').val(),
            origine: $('#origine').val(),
            lienImage: $('#lienImage').val()
        };

        $.ajax({
            url: 'http://localhost:3000/movies',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                alert(response.message);
                window.location.href = 'index.html';
            },
            error: function (xhr, status, error) {
                alert('Erreur lors de l\'ajout du film.');
            }
        });
    });
});