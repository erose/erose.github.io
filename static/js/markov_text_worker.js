// Dependencies.
importScripts('https://cdn.jsdelivr.net/lodash/4.6.1/lodash.min.js');

function randint(min, max) {
    // [Inclusive, exclusive).
    return Math.floor(Math.random() * (max - min)) + min;
}

function weighted_roll(options_to_weights, total_weight){
    // Takes a {obj1: weight1, obj2: weight2, ..., total: <>} object.
    // Returns a random object, with higher weight more likely.

    // For now, ignore weights.
    return _.sample(
        _.keys(_.omit(options_to_weights, 'total'))
    );

    var roll = randint(0, options_to_weights['total']);
    var chosen = undefined;
    _.each(options_to_weights, function(value, key){
        if (key !== "total"){
            if (roll < value){ chosen = key; return; }
            else { roll -= value; }
        }
    });

    return chosen;
}

function get_counts(initial, text, n){
    // Takes a text string and an n-gram size.
    // Returns {n-gram: {char1: count1, char2: count2, ..., total: ()}, ...}
    result = initial

    // We must repeat the first n characters at the end to create a loop.
    // If the last character's not already whitespace, insert a space.
    // This is done to let the end flow smoothly into the beginning.
    if (/\S/.test(text.slice(-1))) {
        text += " ";
    }
    text += text.slice(0, n);

    // Now we want to visit each n+1gram (the +1 is the char we record).
    for (start = 0, end = n; end < text.length; start++, end++){
        var ngram = text.slice(start, end);
        var plus_one = text.charAt(end);

        // Increment the count for this char following this ngram.
        result[ngram] = result[ngram] || {'total': 0};
        result[ngram][plus_one] = (result[ngram][plus_one] || 0) + 1;
        result[ngram]['total'] += 1;
    }

    return result;
}

function get_text(input_texts, n){
    // Returns n characters of text similar to input_text.

    var NGRAM_SIZE = 10;
    var counts = {};
    _.each(input_texts, function(text){
        counts = get_counts(counts, text, NGRAM_SIZE);
    });

    var output_text = "";
    var current_ngram = _.sample(
        _.map(counts, function(value, key){ return key; })
    );

    var current_char = undefined;
    _.times(n, function(){
        current_char = weighted_roll(counts[current_ngram]);
        output_text += current_char;
        // Advance by one character.
        current_ngram = current_ngram.slice(1) + current_char;
    });

    return output_text;
}

onmessage = function(e){
    // Called when there is new text to process from the frontend.
    var content = e.data[0];
    var n = +e.data[1];

    // Concatenate the data from the various input URLs.
    var input_texts = [];
    _.each(content.urls, function(url){
        // Grab the text (async = false).
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);

        input_texts.push(xhr.responseText);
    });

    // Reply to the frontend.
    var output_text = get_text(input_texts, n);
    postMessage([output_text]);
}
