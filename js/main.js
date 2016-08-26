var selectors = {
    widget : '.weather-widget'
}

selectors.instructions = selectors.widget + '__info-instructions';

selectors.form = selectors.widget + '__form';
selectors.city = selectors.widget + '__city';
selectors.country = selectors.widget + '__country';
selectors.submit = selectors.widget + '__submit';

selectors.results = selectors.widget + '__results';
selectors.resultsCity = selectors.widget + '__results-city';
selectors.resultsStats = selectors.widget + '__results-stats';
selectors.resultsDescr = selectors.widget + '__results-stats__descr';
selectors.resultsStatsTemp = selectors.widget + '__results-stats__temp';
selectors.resultsStatsPressure = selectors.widget + '__results-stats__pressure';
selectors.resultsStatsHumidity = selectors.widget + '__results-stats__humidity';
selectors.resultsStatsWindSpeed = selectors.widget + '__results-stats__wind-speed';

var KEY = '0f66a9c6343343e42b696ef5a117f46d';

var weatherWidget = function(el) {
    this.init(el);
}

weatherWidget.prototype.init = function(el) {
    var that = this;
    that.widget = $(el);

    // Getting current location automatically if possible
    that.getCurrrentLocation();

    that.widget.find(selectors.form).submit( function(e) {
        var city = that.widget.find(selectors.city).val();
        var country = that.widget.find(selectors.country).val();

        that.getCurrrentWeather(city, country);
        e.preventDefault();
    });

}

weatherWidget.prototype.getCurrrentLocation = function() {
    var that = this;

    $.ajax({
        type: 'post',
        url: 'http://freegeoip.net/json/',
        crossDomain: true,
        dataType: 'jsonp',
        success: function (data) {
            if (typeof data != "undefined") {
                that.setCurrrentLocation(data);
            }
        }
    });
}

weatherWidget.prototype.setCurrrentLocation = function(data) {
    var that = this;

    that.widget.find(selectors.city).val(data.city);
    that.widget.find(selectors.country).val(data.country_name);
    that.widget.find(selectors.instructions).html('We know where you are!');
    that.widget.find(selectors.form).submit();
}

weatherWidget.prototype.getCurrrentWeather = function(city, country) {
        var that = this;
        var myCity = city;
        var myCountry = country;

        $.ajax({
            type: that.widget.find(selectors.form).attr('method'),
            url: that.widget.find(selectors.form).attr('action') + myCity + ',' + myCountry + '&APPID=' +  KEY + '&units=metric',
            data: that.widget.find(selectors.form).serialize(),
            success: function (data) {
                that.renderWeatherResults(data);
            }
        });
}

weatherWidget.prototype.renderWeatherResults = function(data) {
    var that = this;

    var cod = data.cod;
    var city = data.name;
    var temperature = data.main.temp;
    var pressure = data.main.pressure;
    var humidity = data.main.humidity;
    var descr = data.weather[0].description;
    var windSpeed = data.wind.speed;

    if(cod === 200) {
        that.widget.find(selectors.resultsCity).html('<h2> Weather in ' + city + ' as follows: </h2>');
        that.widget.find(selectors.resultsDescr).html('Summary : ' +  descr);
        that.widget.find(selectors.resultsStatsTemp).html('Temperature : ' +  Math.round(temperature) + '&#8451;');
        that.widget.find(selectors.resultsStatsPressure).html('Pressure : ' +  pressure + 'mm');
        that.widget.find(selectors.resultsStatsHumidity).html('Humidity : ' +  humidity + '%');
        that.widget.find(selectors.resultsStatsWindSpeed).html('Wind : ' +  windSpeed + 'mph');
    }

}

$(function() {
    if ( $(selectors.widget).length ) {
        $(selectors.widget).each(function() {  // For each Clearing search element
            new weatherWidget(this);  // Create a new Clearing search object
        });
    } else {
        return;
    }
});
