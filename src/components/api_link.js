
const auth_link = "https://www.strava.com/oauth/token"
export var link_list = []

function getActivites(res){

    const activities_link = `https://www.strava.com/api/v3/athlete/activities?access_token=${res.access_token}`
    fetch(activities_link)
        .then((res) => console.log(res.json())) 
        link_list.push(activities_link)
        
}

function reAuthorize(){
    fetch(auth_link,{
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'

        },

        body: JSON.stringify({

            client_id: '68377',
            client_secret: '70a79c42470261d53d974053d59cbc64911d007b',
            refresh_token: '31ef8d7537c6b95ac4099c556ebbbbb1ac5fd3aa',
            grant_type: 'refresh_token'
        })
    }).then(res => res.json())
        .then(res => getActivites(res))  
}


reAuthorize()

