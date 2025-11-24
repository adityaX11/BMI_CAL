const form=document.querySelector("form");
form.addEventListener("submit", function(e){
    e.preventDefault(); //its stops the browser from doing its automatic action so you can apply your own custom behavior.

    // extract the value of height and weight from the form.
    const height=parseInt(document.querySelector("#height").value); // i/p of form is string that why we use here parseInt() method.
    const weight=parseInt(document.querySelector("#weight").value);
    const results=document.querySelector("#results");
    const bmi = (weight / ((height * height) / 10000)).toFixed(2);

    // now we check the i/p is valid or not.
    if(height===''||height<0||isNaN(height)){
        results.innerHTML=`Please Give Valid height ${height}`;
    }
    else if(weight===''||weight<0||isNaN(weight)){
        results.innerHTML=`Please give Valid Weight ${weight}`;
    }
    else{
        // when height and weight are valid then calculate the BMI with the apply formula.
        results.innerHTML=`<span>Your BMI:${bmi}</span>`;
    }

    // check the status.
    const status=document.querySelector("#status");
    if(bmi<=18.6){
        status.innerHTML=`<span>You Are Under Weight.</span>`;
        status.style.color="black";
    }
    else if(bmi>18.8 && bmi<=24.90){
        status.innerHTML=`<span>Your Weight is Normal.</span>`;
        status.style.color="black";
    }
    else{
        status.innerHTML=`<span>You Are Over Weight.</span>`;
        status.style.color="black";

    }
});