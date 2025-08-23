from PIL import Image
import os
import base64
import io

# Criar diretório se não existir
favicon_dir = 'static/images/favicons'
os.makedirs(favicon_dir, exist_ok=True)

# Cores do ícone
background_color = (56, 161, 105)  # Verde do sistema
icon_color = (255, 255, 255)  # Branco

def create_icon(size):
    # Criar uma nova imagem com fundo transparente
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    
    # Desenhar um círculo preenchido
    circle = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    for x in range(size):
        for y in range(size):
            # Calcular distância do centro
            dx = x - size/2
            dy = y - size/2
            distance = (dx**2 + dy**2)**0.5
            
            # Se dentro do círculo, pintar
            if distance <= size/2:
                circle.putpixel((x, y), background_color)
    
    # Combinar as imagens
    image.paste(circle, (0, 0), circle)
    
    return image

# Gerar favicons em diferentes tamanhos
sizes = [16, 32, 48, 64, 128, 256]
for size in sizes:
    icon = create_icon(size)
    icon.save(os.path.join(favicon_dir, f'favicon-{size}x{size}.png'))
    
    # Salvar os tamanhos específicos solicitados
    if size == 16:
        icon.save(os.path.join(favicon_dir, 'favicon-16x16.png'))
    elif size == 32:
        icon.save(os.path.join(favicon_dir, 'favicon-32x32.png'))

# Criar o favicon.ico com múltiplos tamanhos
favicon = create_icon(32)
favicon.save(os.path.join(favicon_dir, 'favicon.ico'), format='ICO', sizes=[(16, 16), (32, 32), (48, 48)]) 