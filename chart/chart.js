
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['time', 'time two', 'time three'],
        datasets: [{
            label: "city one name",
            data: weatherInfo[0],
            borderColor: "Red",
            backgroundColor: "Red",
            borderWidth: 1,
            fill: false
        }, {
            label: 'city two name',
            data: weatherInfo[1],
            backgroundColor: "Green",
            borderColor: "Green",
            borderWidth: 1,
            fill: false
        }, {
            label: 'City three name',
            data: weatherInfo[2],
            backgroundColor: "Blue",
            borderColor: "Blue",
            borderWidth: 1,
            fill: false
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
