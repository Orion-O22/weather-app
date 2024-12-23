class WeatherApp {
    constructor() {
        this.apiKey = 'c3a8c1070b8a7d0e19a27ddcbbee01df'; // Replace with actual OpenWeatherMap API key
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.isCelsius = true;

        this.cityInput = document.getElementById('city-input');
        this.searchBtn = document.getElementById('search-btn');
        this.unitToggle = document.getElementById('unit-toggle');
        this.currentWeather = document.getElementById('current-weather');
        this.forecast = document.getElementById('forecast');
        this.errorDisplay = document.getElementById('error-display');
        this.loadingSpinner = document.getElementById('loading-spinner');

        this.bindEvents();
    }

    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.getWeather());
        this.unitToggle.addEventListener('click', () => this.toggleUnit());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.getWeather();
        });
    }

    async getWeather() {
        const city = this.cityInput.value.trim();
        if (!this.validateInput(city)) {
            this.showError('Please enter a valid city name');
            return;
        }

        this.showLoading(true);
        try {
            const [weather, forecast] = await Promise.all([
                this.fetchWeatherData(city),
                this.fetchForecastData(city)
            ]);
            
            if (weather.cod !== 200 || forecast.cod !== "200") {
                throw new Error(weather.message || forecast.message);
            }

            this.displayWeather(weather);
            this.displayForecast(forecast);
            this.hideError();
        } catch (error) {
            this.showError('City not found or API error');
        } finally {
            this.showLoading(false);
        }
    }

    async fetchWeatherData(city) {
        const response = await fetch(
            `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`
        );
        if (!response.ok) throw new Error('Weather data fetch failed');
        return await response.json();
    }

    async fetchForecastData(city) {
        const response = await fetch(
            `${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric`
        );
        if (!response.ok) throw new Error('Forecast data fetch failed');
        return await response.json();
    }

    displayWeather(data) {
        const temp = this.formatTemperature(data.main.temp);
        this.currentWeather.innerHTML = `
            <h2>${data.name}, ${data.sys.country}</h2>
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
            <p class="temp">${temp}</p>
            <p class="description">${data.weather[0].description}</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Wind: ${(data.wind.speed * 3.6).toFixed(1)} km/h</p>
        `;
    }

    displayForecast(data) {
        const dailyForecasts = this.groupForecastsByDay(data.list);
        this.forecast.innerHTML = dailyForecasts.map(day => `
            <div class="forecast-item">
                <h3>${new Date(day.dt * 1000).toLocaleDateString('en-US', {weekday: 'short'})}</h3>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
                <p>${this.formatTemperature(day.main.temp)}</p>
            </div>
        `).join('');
    }

    groupForecastsByDay(list) {
        const grouped = {};
        list.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            if (!grouped[date]) grouped[date] = item;
        });
        return Object.values(grouped).slice(1, 6);
    }

    toggleUnit() {
        this.isCelsius = !this.isCelsius;
        this.unitToggle.textContent = `Switch to ${this.isCelsius ? '°F' : '°C'}`;
        const currentCity = this.cityInput.value.trim();
        if (currentCity) {
            this.getWeather();
        }
    }

    validateInput(city) {
        return city.length >= 2 && /^[a-zA-Z\s-]+$/.test(city);
    }

    showError(message) {
        this.errorDisplay.textContent = message;
        this.errorDisplay.style.display = 'block';
    }

    hideError() {
        this.errorDisplay.style.display = 'none';
    }

    showLoading(show) {
        this.loadingSpinner.style.display = show ? 'block' : 'none';
        this.searchBtn.disabled = show;
    }
}

const weatherApp = new WeatherApp();
