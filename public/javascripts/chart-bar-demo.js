// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';



fetch('/admin/report',{
  method:'get'
}).then(data =>data.json())
.then((data) => {


var month=[]
let OverallSales = []


  for(val of data.monthly){

    let date = `${val.detail.month}`
    console.log(date,"DATE%%%%%%%%%%%%%%%%%%%%%")
    month.push(date)
    OverallSales.push(val.count)
  }



// Bar Chart Example
var ctx = document.getElementById("myBarChart");
var myLineChart2 = new Chart(ctx, {
  type: 'bar',
  data: {
    labels:month,
    datasets: [{
      label: "Sales",
      backgroundColor: "rgba(2,117,216,1)",
      borderColor: "rgba(2,117,216,1)",
      data: OverallSales,
    }],
  },
  options: {
responsive:true
  }
});

// Get the chart's base64 image string
var image = myLineChart2.toBase64Image();
console.log(image);

document.getElementById('btn-downloaddd').onclick = function () {
    // Trigger the download
    var a = document.createElement('a');
    a.href = myLineChart2.toBase64Image();
    a.download = 'Month_Report.png';
    a.click();
}


})