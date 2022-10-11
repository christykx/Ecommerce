// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';


fetch('/admin/report',{
  method:'get'
}).then(data =>data.json())
.then((data) => {

  console.log(data);

var DateOfOrder=[]
let OverallSales = []


  for(val of data.daily){

    let date = `${val.detail.day}/${val.detail.month}/${val.detail.year}`
    DateOfOrder.push(date)
    OverallSales.push(val.count)
    console.log(val)
  }



// Area Chart Example
var ctx = document.getElementById("myAreaChart");
var myLineChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels:DateOfOrder,
    datasets: [{
      label: "Sales",
  
      lineTension: 0.3,
      backgroundColor: "rgba(2,117,216,0.2)",
      borderColor: "rgba(2,117,216,1)",
      pointRadius: 5,
      pointBackgroundColor: "rgba(2,117,216,1)",
      pointBorderColor: "rgba(255,255,255,0.8)",
      pointHoverRadius: 5,
      pointHoverBackgroundColor: "rgba(2,117,216,1)",
      pointHitRadius: 50,
      pointBorderWidth: 2,
      data:OverallSales,
    }],
  },
  options: {
    responsive:true
  }
});


// Get the chart's base64 image string
var image = myLineChart.toBase64Image();
console.log(image);

document.getElementById('btn-download').onclick = function () {
    // Trigger the download
    var a = document.createElement('a');
    a.href = myLineChart.toBase64Image();
    a.download = 'Daily_report.png';
    a.click();
}



})



