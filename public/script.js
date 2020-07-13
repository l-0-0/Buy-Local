const signature = $("#sign");
const submit = $("button");

const ctx = signature[0].getContext("2d");

let position = { x: 0, y: 0 };
let drawing = false;

signature.on("mousedown", (e) => {
    drawing = true;
    position.x = e.offsetX;
    position.y = e.offsetY;
    // console.log(position.x, position.y);
});

signature.on("mousemove", (e) => {
    if (drawing == true) {
        sign(ctx, position.x, position.y, e.offsetX, e.offsetY);
        position.x = e.offsetX;
        position.y = e.offsetY;
    }
});

signature.on("mouseup", (e) => {
    if (drawing == true) {
        sign(ctx, position.x, position.y, e.offsetX, e.offsetY);
        position.x = 0;
        position.y = 0;
        drawing = false;
    }
});

submit.on("click", (e) => {
    // const dataUrl = signature[0].toDataURL();
    // console.log(dataUrl);
    const dataUrl = signature[0].toDataURL("image/png", 0.5);
    console.log(dataUrl);
    return $("#dataField").val(dataUrl);
});

function sign(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}
