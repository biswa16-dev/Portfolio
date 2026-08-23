from PIL import Image, ImageDraw

# Load the enhanced logo
img = Image.open('public/logo.png').convert("RGBA")

# Create a circular mask
mask = Image.new('L', img.size, 0)
draw = ImageDraw.Draw(mask)
# Draw a white circle on the black mask
draw.ellipse((0, 0, img.size[0], img.size[1]), fill=255)

# Create a new image with transparent background
circle_img = Image.new('RGBA', img.size, (0, 0, 0, 0))
# Paste the logo using the mask
circle_img.paste(img, (0, 0), mask=mask)

# Save as favicon.png
circle_img.save('public/favicon.png')
print("Favicon created as a circle!")
