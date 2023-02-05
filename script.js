let searchForm = document.querySelector("#search-form");
let searchInput = document.querySelector("#search-input");


const API_KEY = 'ced50569df56fe817bec5ed106175963'

searchForm.addEventListener("submit", (e) => {
    // Prevents the default behavior of making the browser to refresh when form is submitted
    e.preventDefault();

    // get the input value when form is submitted
    let searchInputValue = searchInput.value;

    if (searchInputValue.trim() === '' || searchInputValue.trim() === ' ') {
        throw "Can't be empty"
    }

    // fetch weather data by city
    fetchWeather(searchInputValue)

    // accessing the key `searchHistory from localstorage`
    let ls_search_history = localStorage.getItem("searchHistory");

    // checking if the key `searchHistory` exist in localStorage
    if (ls_search_history) {
        ls_search_history_parsed = JSON.parse(ls_search_history)
        ls_search_history_parsed.unshift(searchInputValue)
        localStorage.setItem("searchHistory", JSON.stringify(ls_search_history_parsed))
    } else {
        localStorage.setItem("searchHistory", JSON.stringify([searchInputValue]))
    }
    getSearchHistory()
    displayHistory()
    // clears input when form is submitted
    searchInput.value = ''
})

getSearchHistory()

function getSearchHistory() {
    let history = document.querySelector("#history")
    history.innerHTML = ''

    if (localStorage.getItem("searchHistory")) {
        let history_datas = JSON.parse(localStorage.getItem("searchHistory"))
        history_datas.forEach((history_data) => {
            let div = document.createElement("div")
            let text = document.createTextNode(history_data)
            div.appendChild(text)
            history.appendChild(div)
        })
    }
}

// Fetch Waether data from openweathermap
function fetchWeather(city) {
    const openWeatherUri = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`

    // show spinner while asynchronous operation is not done
    let backdrop = document.querySelector("#backdrop")
    backdrop.style.display = 'grid';
    // send a get request to openweathermap using jquery ajax
    $.ajax({
        url: openWeatherUri,
        success: (data) => {
            backdrop.style.display = 'none';

            let list = data.list

            // Getting Weather for each day without 3-hour step
            let fiveForecastDates = []
            let fiveForecastList = []
            list.forEach(data => {
                let date = data.dt_txt.split(' ')[0]
                if (fiveForecastDates.indexOf(date) === -1) {
                    fiveForecastDates.push(date)
                    fiveForecastList.push(data)
                }
            })

            displayCurrentWeather(fiveForecastList[0], city)
            fiveForecastList.shift()
            fiveDayForecast(fiveForecastList)

        },
        error: () => {
            backdrop.style.display = 'none';
        }
    })

}

function displayCurrentWeather(weather, city) {
    const today = document.querySelector("#today");

    if (weather.length === 0) {
        throw "An Error occurred"
    }
    const date = moment(weather.dt_txt.split(' ')[0]).format("DD/MM/YYYY")

    today.innerHTML = `
    <h1>${city} (${date})</h1>
    <p>Temp: ${(weather.main.temp - 273).toFixed(2)}&#8451;</p>
    <p>Wind: ${weather.wind.speed}M/S</p>
    <p>Humidity: ${weather.main.humidity}%</p>
    `
    today.style.border = `2px solid dodgerblue`;

}

function fiveDayForecast(weather) {
    let title = document.querySelector("#forecast-title")
    let forecast = document.querySelector('#forecast-list')

    forecast.innerHTML = ''

    title.textContent = '5-day Format:'
    weather.forEach(data => {
        forecast.innerHTML += `
        <div>
        <p id="forecast-list-date">${moment(data.dt_txt.split(' ')[0]).format("DD/MM/YYYY")}</p>
        <p>Temp: ${(data.main.temp - 273).toFixed(2)}&#8451;</p>
        <p>Wind: ${data.wind.speed}M/S</p>
        <p>Humidity: ${data.main.humidity}%</p>
      </div>
        `
    })
}

// Display weather data from history
function displayHistory() {
    let history = document.querySelectorAll("#history div")

    history.forEach(ht => {
        ht.addEventListener('click', (e) => {
            let city = e.target.textContent;
            fetchWeather(city)
        })
    })
}
displayHistory()