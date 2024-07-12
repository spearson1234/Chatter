document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('generateBtn').addEventListener('click', generatePoem);

    function generatePoem() {
        const poem = `
            Your love is like a sunset's glow,<br>
            Soft and warm, it makes me whole.<br>
            With every touch, my heart does know,<br>
            Our bond is deep, an endless scroll.<br><br>
            
            Your eyes, they shine like morning dew,<br>
            In them, my dreams are painted true.<br>
            With every glance, I fall anew,<br>
            My love for you, forever grew.<br><br>
            
            Together we dance through life's sweet song,<br>
            With you, my dear, I belong.<br>
            Our hearts, they beat a rhythm strong,<br>
            In your arms, I've found my home.<br>
        `;
        document.getElementById('poem').innerHTML = poem;
    }
});
