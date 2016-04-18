var w = new Worker("/static/js/markov_text_worker.js");

function press(){
    // Entry point for the UI -- gets called when the user clicks 'generate'.
    $("#still-icon").toggle();
    $("#active-icon").toggle();

    input_text = $("#input-text").val();
    w.postMessage([input_text, 1000]);
}
w.onmessage = function(e){
    // Called when we recieve a message from the worker.
    var output_text = e.data[0];

    $("#output-text").val(output_text);

    $("#still-icon").toggle();
    $("#active-icon").toggle();
}