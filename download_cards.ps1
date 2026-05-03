$suits = @('oros', 'copas', 'espadas', 'bastos')
$values = @('01', '02', '03', '04', '05', '06', '07', '10', '11', '12')
$baseUrl = "https://raw.githubusercontent.com/mcmd/playingcards.io-spanish.playing.cards/master/img/"
$targetDir = "src/assets/cards/"

foreach ($suit in $suits) {
    foreach ($value in $values) {
        $filename = "$value-$suit.png"
        $url = "$baseUrl$filename"
        $target = Join-Path $targetDir $filename
        Write-Host "Downloading $url to $target"
        curl -o $target $url
    }
}

# Download the back of the card
curl -o (Join-Path $targetDir "back.png") "$baseUrl/back-blue.png"
