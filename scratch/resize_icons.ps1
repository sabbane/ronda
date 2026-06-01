Add-Type -AssemblyName System.Drawing
$logoPath = "d:\Dev\ronda\public\logo.png"

# Load image
$image = [System.Drawing.Image]::FromFile($logoPath)

# 192x192
$bitmap192 = New-Object System.Drawing.Bitmap(192, 192)
$graphic192 = [System.Drawing.Graphics]::FromImage($bitmap192)
$graphic192.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphic192.DrawImage($image, 0, 0, 192, 192)
$bitmap192.Save("d:\Dev\ronda\public\pwa-192x192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap192.Dispose()
$graphic192.Dispose()

# 512x512
$bitmap512 = New-Object System.Drawing.Bitmap(512, 512)
$graphic512 = [System.Drawing.Graphics]::FromImage($bitmap512)
$graphic512.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphic512.DrawImage($image, 0, 0, 512, 512)
$bitmap512.Save("d:\Dev\ronda\public\pwa-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap512.Dispose()
$graphic512.Dispose()

$image.Dispose()
Write-Host "PWA icons resized successfully!"
