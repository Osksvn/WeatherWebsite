
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['time', 'time two', 'time three'],
        datasets: [{
            label: "city one name",
            data: [12, 19, 3, 5, 2, 3],
            borderColor: "Red",
            backgroundColor: "Red",
            borderWidth: 1,
            fill: false
        }, {
            label: 'city two name',
            data: [16, 12, 7, 5, 19, 10],
            backgroundColor: "Green",
            borderColor: "Green",
            borderWidth: 1,
            fill: false
        }, {
            label: 'City three name',
            data: [5, 13, 3, 19, 10, 15],
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

function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}