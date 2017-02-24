var selectors = {
    widget : '.weather-widget'
}

selectors.instructions = selectors.widget + '__info-instructions';

selectors.form = selectors.widget + '__form';
selectors.city = selectors.widget + '__city';
selectors.country = selectors.widget + '__country';
selectors.days = selectors.widget + '__days';
selectors.submit = selectors.widget + '__submit';

selectors.results = selectors.widget + '__results';
selectors.resultsCity = selectors.widget + '__results-city';
selectors.resultsToday = selectors.widget + '__results-today';
selectors.resultsStats = selectors.widget + '__results-stats';
selectors.resultsDescr = selectors.widget + '__results-stats__descr';
selectors.resultsStatsTemp = selectors.widget + '__results-stats__temp';
selectors.resultsStatsPressure = selectors.widget + '__results-stats__pressure';
selectors.resultsStatsHumidity = selectors.widget + '__results-stats__humidity';
selectors.resultsStatsWindSpeed = selectors.widget + '__results-stats__wind-speed';

var KEY = '603b6f7fd7e34d1c869132709172302';

var WeatherWidget = function(el) {
    this.init(el);
}

WeatherWidget.prototype.init = function(el) {
    var that = this;
    that.widget = $(el);

    // Getting current location automatically if possible
    that.getCurrrentLocation();

    that.widget.find(selectors.form).submit( function(e) {
        var city = that.widget.find(selectors.city).val();
        var country = that.widget.find(selectors.country).val();
        var days = that.widget.find(selectors.days).val();

        if (city !== "") {
            that.getCurrrentWeather(city, days, country);
        }
        e.preventDefault();
    });

}

WeatherWidget.prototype.getCurrrentLocation = function() {
    var that = this;

    $.ajax({
        type: 'post',
        url: 'https://freegeoip.net/json/',
        crossDomain: true,
        dataType: 'jsonp',
        success: function (data) {
            if (typeof data != "undefined") {
                that.setCurrrentLocation(data);
            }
        }
    });
}

WeatherWidget.prototype.setCurrrentLocation = function(data) {
    var that = this
    var city = (data.city) ? data.city : data.latitude + ',' + data.longitude;

    that.widget.find(selectors.city).val(city);
    that.widget.find(selectors.country).val(data.country_name);
    that.widget.find(selectors.instructions).html('We know where you are!');
    that.widget.find(selectors.form).submit();
}

WeatherWidget.prototype.getCurrrentWeather = function(city, days, country) {
        var that = this;
        var city = city;
        var days = days;
        var country = country;
        var api = null;

        if(days !== "") {
            api = 'forecast';
        } else {
            api = 'current';
        }

        $.ajax({
            crossDomain: true,
            dataType: 'json',
            type: that.widget.find(selectors.form).attr('method'),
            url: that.widget.find(selectors.form).attr('action') + api +'.json?key=' +  KEY + "&q=" + city + ',' + country + '&units=metric' + '&days=' + days,
            data: that.widget.find(selectors.form).serialize(),
            success: function(data) {
                that.renderWeatherResults(data);
            }
        });

}

WeatherWidget.prototype.convertDate = function(dateString) {
    var date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        // Months use 0 index.
        return date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
    }
}

WeatherWidget.prototype.renderWeatherResults = function(data) {
    var that = this;
    var city = data.location.name;
    var temperature = data.current.temp_c;
    var pressure = data.current.pressure_mb;
    var humidity = data.current.humidity;
    var descr = data.current.condition.text;
    var windSpeed = data.current.wind_kph;

    // Renderring data for today
    that.widget.find(selectors.resultsCity).html('<h2> Weather in ' + city + ' as follows: </h2>');
    that.widget.find(selectors.resultsToday).html('<h3> Today: </h3>');
    that.widget.find(selectors.resultsDescr).html('Summary : ' +  descr);
    that.widget.find(selectors.resultsStatsTemp).html('Temperature : ' +  Math.round(temperature) + '&#8451;');
    that.widget.find(selectors.resultsStatsPressure).html('Pressure : ' +  pressure + 'mm');
    that.widget.find(selectors.resultsStatsHumidity).html('Humidity : ' +  humidity + '%');
    that.widget.find(selectors.resultsStatsWindSpeed).html('Wind : ' +  windSpeed + 'mph');

    // Rendering forecast data
    if(data.forecast) {
        var toAppend = ['<ul class="weather-widget__forecast-stats__items">'];
        $.each(data.forecast.forecastday, function(index, value) {
            var date = that.convertDate(new Date(value.date));
            toAppend.push('<li id="li-' + index + '" class="weather-widget__forecast-stats__item col-lg-12">'
                            + '<ul id="ul-' + index + '">'
                                + '<li class="col-lg-2">' + date + '</li>'
                                + '<li class="col-lg-4">' + value.day.condition.text + '</li>'
                                + '<li class="col-lg-2">' + Math.round(value.day.avgtemp_c) + '&#8451;' + '</li>'
                                + '<li class="col-lg-2">' + value.day.avghumidity + '%' + '</li>'
                                + '<li class="col-lg-2">' + value.day.maxwind_mph + 'mph' + '</li>'
                            + '</ul>'
                        +'</li>');
        });
        toAppend.push('</ul>');
        $(".weather-widget__forecast-stats").empty().append(toAppend.join(""));
    }
}

$(function() {
    if ( $(selectors.widget).length ) {
        $(selectors.widget).each(function() {  // For each Clearing search element
            new WeatherWidget(this);  // Create a new Clearing search object
        });
    } else {
        return;
    }
});
