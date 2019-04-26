var data;
var resultP; // declaring the paragraph
var resultDivs = [];

function preload()
{
    data =  loadJSON('movies.json')
}

function setup()
{
      noCanvas(); // P5 method that removes the default canvas drawing from a p5 sketch
      users = {}; // Now we declared the lookup table for our users

    // Second we should create two dropdown menues for selecting the users
    var  dropdown = createSelect();

    // Now we will fill the drop downs

    for(var i = 0; i < data.users.length; i++)
    {
        var name = data.users[i].name;
        dropdown.option(name);
        users[name] = data.users[i]; // Create the lookup table
    }

    var button1 = createButton('Euclidean Similarity');
    var button2 = createButton('Correlation Coefficient');

    resultP = createP('');

    button1.mousePressed(findNearestNeighborsWithEuclidean);
    button2.mousePressed(findNearestNeighborsWithCC);

    function findNearestNeighborsWithEuclidean()
    {
        for (var x=0; x < resultDivs.length; x++)
            resultDivs[x].remove();

        resultDivs = [];

        var name = dropdown.value();
        var similarityScores = {};

        for(var i = 0; i < data.users.length; i++)
        {
            var other = data.users[i].name;

            if(other !== name)
                similarityScores[other] = euclideanDistance(name , other);
            else
                similarityScores[other] = -1;
        }

        data.users.sort(compareSimilarity);

        function compareSimilarity(a , b)
        {
            var score1 = similarityScores[a.name];
            var score2 = similarityScores[b.name];

            return score2 - score1;
        }

        var k = 5;
        for(i = 0; i < k; i++)
        {
            var nearestName = data.users[i].name;
            var div = createDiv(nearestName + ': ' + similarityScores[nearestName]);
            resultDivs.push(div);
            resultP.parent(div);
        }

        console.log(similarityScores)
    }

    function findNearestNeighborsWithCC()
    {
        for (var x=0; x < resultDivs.length; x++)
            resultDivs[x].remove();

        resultDivs = [];

        var name = dropdown.value();
        var similarityScores = {};

        for(var i = 0; i < data.users.length; i++)
        {
            var other = data.users[i].name;

            if(other !== name)
                similarityScores[other] = correlationCoefficient(name , other);
            else
                similarityScores[other] = -1;
        }

        data.users.sort(compareSimilarity);

        function compareSimilarity(a , b)
        {
            var score1 = similarityScores[a.name];
            var score2 = similarityScores[b.name];

           return score2 - score1;
        }

        var k = 5;
        for(i = 0; i < k; i++)
        {
           var nearestName = data.users[i].name;
           var div = createDiv(nearestName + ': ' + similarityScores[nearestName]);
           resultDivs.push(div);
           resultP.parent(div);
        }
        console.log(similarityScores)
    }
}

function euclideanDistance(name1 , name2)
{
    var ratings1 = users[name1];
    var ratings2 = users[name2];

    var objectTitles = Object.keys(ratings1);
    var i = objectTitles.indexOf('name');
    objectTitles.splice(i , 1);

    i = objectTitles.indexOf('timestamp');
    objectTitles.splice(i , 1);

    var distance = 0;

    for(i = 0; i < objectTitles.length; i++)
    {
        var title = objectTitles[i];
        var rating1 = ratings1[title];
        var rating2 = ratings2[title];

        if(rating1 && rating2)
            distance += Math.abs(rating1 - rating2 )
    }

    return 1 / (1 + distance);
}

function correlationCoefficient(name1 , name2)
{

    var ratings1 = users[name1];
    var ratings2 = users[name2];

    var objectTitles = Object.keys(ratings1);
    var i = objectTitles.indexOf('name');
    objectTitles.splice(i , 1);

    i = objectTitles.indexOf('timestamp');
    objectTitles.splice(i , 1);

    var n = objectTitles.length;
    var xMean = calcMean(objectTitles , ratings1);
    var xSD = calcStandardDeviation(xMean , ratings1 , objectTitles);
    var yMean = calcMean(objectTitles , ratings2);
    var ySD = calcStandardDeviation(yMean , ratings2 , objectTitles);

    var sum = 0;

    if(xSD === 0)
        xSD = 1;
    if(ySD === 0)
        ySD = 1;
    if(n === 1)
        n = 2;

    for(i = 0; i < objectTitles.length; i++)
    {
        var title = objectTitles[i];
        var rating1 = ratings1[title];
        var rating2 = ratings2[title];

        sum += (((rating1 - xMean) / xSD) * ((rating2 - yMean) / ySD))
    }

    return (1/(n-1)) * sum;
}

function calcMean(titles , ratings)
{
    var sum = 0;
    for(var i = 0; i<titles.length; i++)
    {
        var title = titles[i];
        sum += ratings[title];
    }

    return titles.length !== 0 ?  sum / titles.length : 0;
}

function calcStandardDeviation(mean , ratings , titles)
{
    var sum = 0;
    for(var i = 0; i<titles.length; i++)
    {
        var title = titles[i];
        sum += Math.pow((ratings[title] - mean) , 2);
    }

    sum  = (titles.length - 1) !== 0 ? sum / (titles.length - 1) : 0;

    return Math.sqrt(sum)
}
