<!DOCTYPE html>
<html lang="hy">
<head>
    <meta charset="UTF-8">
    <title>Իմ Minecraft Սերվերը</title>
</head>
<body>
    <h1>Բարի գալուտ իմ Minecraft սերվերի կայք</h1>
    <p>Սերվերի հասցե՝ <strong>play.example.com</strong></p>
    <div id="status">Սերվերի վիճակը բեռնվում է...</div>

    <script>
        fetch("https://api.mcsrvstat.us/2/play.example.com")
        .then(response => response.json())
        .then(data => {
            const statusDiv = document.getElementById("status");
            if (data.online) {
                statusDiv.innerHTML = `Սերվերը առցանց է։ Խաղացողներ՝ ${data.players.online}`;
            } else {
                statusDiv.innerHTML = "Սերվերը անջատված է։";
            }
        });
    </script>
</body>
</html>