import React from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';


const baseUrl = 'https://transport.rest';
const maxNStations = 50; // FIXME: Looks like the cap is at 35
const initialNStations = 2;


class StationBox extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			maxMinutesToDeparture: 120,
			currentFocus: null,
			latitude: props.latitude,
			longitude: props.longitude,
		};
		this.hammerjsElement = new Hammer(document);
		this.stations = [];
		this.stationsWithInfo = [];
		this.fetchStations();
	}

	fetchStations() {
		const urlWithLocation = `${baseUrl}/stations/nearby?latitude=${this.state.latitude}&longitude=${this.state.longitude}&results=${maxNStations}`;

		fetch(urlWithLocation)
			.then(r => r.ok ? r.json() : Promise.reject(r))
			.then(stationsWithoutDepartures => {
				this.stations = stationsWithoutDepartures;
				const initialStations = stationsWithoutDepartures.slice(0, initialNStations);
				Promise.all(initialStations.map(this.getDepartures.bind(this)))
					.then(stations => {
						this.stationsWithInfo = stations;
						this.setState({ currentFocus: 0 });
					})
					.catch(err => console.log(err));
			})
	}

	getDepartures(station) {
		const urlWithId = `${baseUrl}/stations/${station.id}/departures
			?duration=${this.state.maxMinutesToDeparture}`;

		return new Promise((resolve, reject) => {
			fetch(urlWithId)
				.then(r => r.ok ? r.json() : resolve({ station: station, departures: [], error: 'with get Departure' }))
				.then(function(departures) {
					departures = departures.sort((a, b) => a.when - b.when);
					resolve({ station: station, departures: departures, error: '' });
				})
		})
	}

	componentDidMount() {
		// subscribe to events
		this.hammerjsElement.on('swipeleft', (e) => {
			e.preventDefault();
			const n = this.stationsWithInfo.length; // number of avaible station+infos
			this.getDepartures(this.stations[n])
				.then(newStationInfo => this.stationsWithInfo.push(newStationInfo));
			this.setState({ currentFocus: this.state.currentFocus + 1 });
		});

		this.hammerjsElement.on('swiperight', (e) => {
			e.preventDefault();
			const newfocus = Math.max(0, this.state.currentFocus - 1);
			this.setState({ currentFocus: newfocus });
		});    
	}


	render() {
		if(this.stationsWithInfo.length > 0) {
			const currentStation = this.stationsWithInfo[this.state.currentFocus];
			return <ReactCSSTransitionGroup transitionName="example" transitionEnterTimeout={500} transitionLeaveTimeout={1}>
				<Station key={currentStation.station.name} departures={currentStation.departures} station={currentStation.station} error={currentStation.error}/>
			</ReactCSSTransitionGroup>
		}
		return <div>
				Loading data from server...
				<div className="loader"></div>
			</div>;
	}
}

function replaceWithDefault(event) {
	const oldSrc = event.target.src;
	const stationId = oldSrc.match(/\d+.jpg$/)[0].split('.')[0];
	const hashed = hash(stationId);
	const newSrc = `img/default/cropped/${hashed}.jpg`;
	event.target.src = newSrc;
}


class Station extends React.Component {

	render() {
		if (this.props.departures.length) {
			return <div className="station">
					<img onError={replaceWithDefault.bind(this)} src={`img/stations/${this.props.station.id}.jpg`} alt="Station Picture"/>
					<h2>{this.props.station.name}</h2>
					<table>
						<thead>
							<tr>
								<th>Line</th>
								<th>Destination</th>
								<th>Departure</th>
							</tr>
						</thead>
						<tbody>
							{this.props.departures.map(x => <Departure departure={x} /> )}
						</tbody>
					</table>
				</div>;
		} else {
			if (this.props.error !== '') {
				return <div>
					<h2>{this.props.station.name}</h2>
					<p>Error: {this.props.error}</p>
					</div>;
			} else {
				return <div>
					<h2>{this.props.station.name}</h2>
					<p>Currently no departures</p>
					</div>;
			}
		}
	}
}

class Departure extends React.Component {

	render() {
		const departure = this.props.departure;
		const time = new Date(departure.when * 1000);
		const timeDif = time.getTime() - new Date().getTime();
		const minutes = Math.floor(timeDif / (1000 * 60));
		let timeString = `${minutes} min`;
		if (minutes < 1) timeString = 'now'
		if (minutes > 30) {
			let hours = new String(time.getHours());
			let minutes = new String(time.getMinutes());
			hours = hours.length > 1 ? hours : `0${hours}`;
			minutes = minutes.length > 1 ? minutes : `0${minutes}`;
			timeString = `${hours}:${minutes}`;
		}

		// somtimes, you have to break the line to prevent the table from fucking up.
		// because we have genereted dynamicly html, we have to set the html
		// in a dangarous way. (see further below)
		const direction = departure.direction.replace('/','/<wbr>');
		const line = departure.product.line;
		const type = departure.product.type.unicode;
		const lineString = `${type} ${line}`;
		
		return <tr>
			<td key="line">{lineString}</td>
			<td key="direction" dangerouslySetInnerHTML={{__html: direction }}></td>
			<td key="time">{timeString}</td>
		</tr>;
	}
}

// number of default pictures
function hash(x){
    return x % 89;
}

function successfullyLocated(location) {
	const latitude = location.coords.latitude;
	const longitude = location.coords.longitude;
	ReactDOM.render(<StationBox longitude={longitude} latitude={latitude}/>, document.getElementById('stationBox'));
}

function failedLocated(error) {
	console.log('failed location');
	$("#stationBox").html("NO");
}

$(function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successfullyLocated, failedLocated);
  } else {
    $(body).innerHTML = "Geolocation is not supported by this browser.";
  }
});

