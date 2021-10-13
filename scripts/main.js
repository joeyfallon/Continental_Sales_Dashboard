// Global constants
const DEBUG = true;
const DINGUS_PRICE = 14.25;
const WIDGET_PRICE = 9.99;

// Some little helpers
const log = msg => (DEBUG ? console.log(msg) : '');
const select = id => document.getElementById(id);

function createMap() {
	Highcharts.getJSON('/data/continents.json', function (geojson){
		console.log(geojson.features['0'].properties.CONTINENT)
		var names = [
			['ASIA'],['AUSTRALIA'], ['NORTHAMERICA'], 
			['SOUTHAMERICA'], ['AFRICA'], ['EUROPE'],
			['ANTARCTICA']
		]
		Highcharts.mapChart('map',{
			chart: {
				map: geojson,
			},
			title: {
				text: ''
			},
			mapNavigation: {
				enabled: false,
				buttonOptions: {
					verticalAlign: 'bottom'
				}
			},
			series: [{
				data: names,
				keys: ['CONTINENT'],
				joinBy: 'CONTINENT',
				dataLabels: {
					enabled: true,
					format: "{point.properties.CONTINENT}",
					style: {
						fontSize: '10px',
						color: 'black',
						textOutline: '0'
					}
				},
				color: '#DDDDDD',
				states: {
					hover: {
						color: '#0C3'
					},
					select: {
						color: '#7CA82B'
					}
				},
				allowPointSelect: true
			}],
			plotOptions: {
				series: {
					point: {
						events: {
							click: function() {
								plotPie(this.CONTINENT);
								plotColumn(this.CONTINENT);
								updateScoreCards(this.CONTINENT);
							}
						}
					}
				},
			},
			tooltip: {
				formatter: function() {
					return this.point.CONTINENT;
				}
			},
			legend: {
				enabled: false
			},
			credits: {
				enabled: false
			}

		})
	})
}

function plotSales(sales) {
	createMap();
	data = sales;
}

function plotColumn(continent) {
	console.log(continent)
	let dingusValues = {
		data: [],
		name: "Dingus"
	}
	let widgetValues = {
		data: [],
		name: "Widget"
	}
	let sales = data[continent];
	for (const datum of sales) {
		let month = datum['Month'];
		let dingus = datum['Dingus'];
		let widget = datum['Widget'];
		dingusValues['data'].push(dingus);
		widgetValues['data'].push(widget);
	}
	Highcharts.chart('salesPerMonthChart', {
		chart: {
			type: 'column'
		},
		credits: {
			enabled: false
		},
		colors: ['#1D93BE','#D41F1E'],
		plotOptions: {
			columns: {
				colorByPoint: true
			}
		},
		title: {
			text: 'Monthly Sales',
			style: {
				fontSize: '25px',
				fontFamily: 'Montserrat',
			}			
		},
		xAxis: {
			label: {
				text: 'Month'
			},
			type: 'category',
			categories: ["January", "February", "March "],
		},
		yAxis: {
			title: {
				text: 'Number of Units sold'
			}
		},
		legend: {
			borderWidth: 1,
			borderColor: 'lightgrey',
			itemMarginBottom: 5,
			itemMarginTop: 5,
			align: 'right',
			verticalAlign: 'top',
			layout: 'vertical',
			labelFormatter: function() {
				return this.name
			}
		},
		series: [
			dingusValues, widgetValues
		]
	});
}

function plotPie(continent) {
	let sales = data[continent];
	let dinguses = 0, widgets = 0, totalProduct = 0;
	for (const datum of sales) {
		dinguses += datum['Dingus'];
		widgets += datum['Widget'];
	}
	totalProduct = dinguses + widgets
	// handling percentages
	dingusPercent = Number((dinguses / totalProduct).toFixed(3))
	widgetPercent = Number((widgets / totalProduct).toFixed(3))
	//Highcharts
	if (continent === 'ANTARCTICA') {
		Highcharts.chart('totalSalesChart', {
			chart: {
				type: 'pie'
			},
			title: {
				text: ''
			},
			credits: {
				enabled: false
			}
		})
	}
	else {
		Highcharts.chart('totalSalesChart', {
			chart: {
				margin: 40,
				marginRight: 100
			},
			setOptions: {
				colors: ['red', 'blue']
			},
			title: {
				text: 'Total Sales',
				style: {
					fontSize: '25px',
					fontFamily: 'Montserrat',
				}			
			},
			credits: {
				enabled: false
			},
			tooltip: {
				formatter: function() {
					return this.point.y;
				}
			},
			legend: {
				borderWidth: 1,
				borderColor: 'lightgrey',
				itemMarginBottom: 5,
				itemMarginTop: 5,
				align: 'right',
				verticalAlign: 'top',
				layout: 'vertical',
				labelFormatter: function() {
					return this.name
				}
			},
			plotOptions: {
				pie: {
					dataLabels: {
						enabled: true,
						formatter: function() {
							return (String(this.point.z * 100)).slice(0,4) + "%"
						},
						distance: -80,
						style: {
							fontSize: '20px',
							color: 'white',
							textOutline: '0'
						},
					},
					showInLegend: true
				}
			},
			series: [{
				type: 'pie',
				colorByPoint: true,
				data: [{
					name:'Dingus',
					z: dingusPercent,
					y: dinguses,
					color: '#1D93BE'
				}, {
					name:'Widget',
					z: widgetPercent,
					y: widgets,
					color: '#D41F1E'
				}]
			}]
		})
	}
}

function updateScoreCards(continent) {
	let sales = data[continent];
	let dinguses = 0, widgets = 0;
	for (const datum of sales) {
		dinguses += datum['Dingus'];
		widgets += datum['Widget'];
	}
	let revenue = DINGUS_PRICE * dinguses + WIDGET_PRICE * widgets;
	select('dingusSold').innerHTML = dinguses;
	select('widgetSold').innerHTML = widgets;
	select('totalSales').innerHTML = revenue.toFixed(2);
}

async function loadJSON(path) {
	let response = await fetch(path);
	let dataset = await response.json(); // Now available in global scope
	return dataset;
}

function plotStocks(stocks) {
	let prices = [];
	for (datum of stocks) {
		//log(datum);
		prices.push([datum['Date'], datum['Adj Close']]);
		
	}
};

function stockChart(stocks) {
	// creating data for the chart
	let stockPrices = [];
	for (datum of stocks) {
		stockPrices.push([datum['Date'], Number(datum['Adj Close'].toFixed(2))]);
	}
	console.log(stockPrices)
	var chart = Highcharts.stockChart('stocks', {
		chart: {
			margin: 60
		},
		title: {
			text: 'Dynamic Growth',
			style: {
				color: 'black',
				fontWeight: 'bold',
				fontSize: '25px',
				fontFamily: 'Montserrat',
			}
		},
		scrollbar: {
			enabled: false
		},
		subtitle: {
			text: 'Stock Prices of D&W Corp. from 2015-Present',
			style: {
				color: 'black',
				fontWeight: 'bold'
			}
		},
		xAxis: {
			min: Date.UTC(2015, 12, 8, 0),
			title: {
				text: 'Date', 
				style: {
					color: 'black',
					fontWeight: 'bold'
				}
			},
			type: 'datetime',
			labels: {
				format: '{value:%m/%e/%y}'
			},
			tickInterval: 100 * 24 * 3600 * 1000,
			// 100 * 24 * 3600 * 1000
			tickColor: 'gray',
			tickLength: 5,
			crosshair: {
				className: 'x-crosshair',
				color: 'gray',
				label: {
					enabled: true
				}
			},
			showLastLabel: true,
			lineColor: 'gray',
			series: [{
				type: 'area',
				data: 'datetime',
				}
			],
		},
		yAxis: {
			title: {
				enabled: true,
				text: 'Adj Close Stock Price',
				style: {
					color: 'black',
					fontWeight: 'bold'
				}
			},
			opposite: false,
			visable: true,
			max: 160,
			tickInterval: 20,
			tickLength: 7,
			tickWidth: 1,
			tickColor: 'gray',
			lineWidth: 1,
			lineColor: 'gray',
			crosshair: {
				className: 'y-crosshair',
				color: 'gray',
				label: {
					enabled: true,
					alight: 'left',
				},
			},
			series: [{
				type: 'area',
				name: "Adj. Closing Price",
				data: stockPrices,
				}
			],
		},
		navigator: {
			enabled: false
		},
		rangeSelector: {
			selected: 5,
			inputEnabled: false,
			buttonTheme: {
				visibility: 'hidden'
			},
			labelStyle: {
				visibility: 'hidden'
			}
		},
		plotOptions: {
			area: {
				fillOpacity: 0.40,
			},
		},
		tooltip: {
			valueDecimals: 2,
			crosshairs: [true, true],
			formatter: function () {
				return "$<b>" + Number(this.y.toFixed(2));
			}
		},
		legend: {
			enabled: false
		},
		series: [{
			type: 'area',
			name: "Adj. Closing Price",
			color: '#28a2cc',
			fillOpacity: 0.25,
			data: stockPrices,
			}
		],
		credits: {
			enabled: false
		}	
	})
};

function init() {
	salesPromise = loadJSON('/data/sales.json');
	stocksPromise = loadJSON('/data/stocks.json');
	mapData = loadJSON('data/continents.json')
	console.log(mapData)
	salesPromise.then(function (sales) {
		plotSales(sales);
	});
	stocksPromise.then(function (stocks) {
		plotStocks(stocks);
		stockChart(stocks)
	});
}

document.addEventListener('DOMContentLoaded', init, false);
