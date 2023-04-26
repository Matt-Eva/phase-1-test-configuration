
function getData() {
    return fetch('http://localhost:3000/data')
      .then(response => response.json())
      .then(data => {
        return data;
      })
      .catch(error => {
        console.error(error);
      });
  }

  function createEventListener(){
    const button = document.getElementById("click-me")
    button.addEventListener("click", () =>{
        console.log("event listener firing")
        const h2 = document.createElement('h2')
        h2.textContent = "second-header"
        document.body.append(h2)
    })
}
createEventListener()

 export {
    getData,
    createEventListener
  }