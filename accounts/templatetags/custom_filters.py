from django import template
import re

register = template.Library()

@register.filter
def split(value, arg):
    """
    Retorna uma lista contendo a string dividida pelo separador especificado
    """
    return value.split(arg)

@register.filter
def format_telefone(value):
    """
    Formata um número de telefone brasileiro para exibição
    Exemplos:
    11999999999 -> (11) 99999-9999
    67999999999 -> (67) 99999-9999
    1133334444 -> (11) 3333-4444
    """
    if not value:
        return ''
    
    # Remove tudo que não é número
    numbers = re.sub(r'\D', '', str(value))
    
    if len(numbers) == 11:  # Celular: (XX) 9XXXX-XXXX
        return f"({numbers[:2]}) {numbers[2:7]}-{numbers[7:]}"
    elif len(numbers) == 10:  # Fixo: (XX) XXXX-XXXX
        return f"({numbers[:2]}) {numbers[2:6]}-{numbers[6:]}"
    elif len(numbers) == 9:  # Celular sem DDD: 9XXXX-XXXX
        return f"{numbers[:5]}-{numbers[5:]}"
    elif len(numbers) == 8:  # Fixo sem DDD: XXXX-XXXX
        return f"{numbers[:4]}-{numbers[4:]}"
    else:
        return value  # Retorna o valor original se não conseguir formatar

@register.filter
def telefone_link(value):
    """
    Cria um link clicável para telefone (tel:)
    """
    if not value:
        return ''
    
    # Remove tudo que não é número
    numbers = re.sub(r'\D', '', str(value))
    
    if numbers:
        return f"tel:+55{numbers}"
    return ''

@register.filter
def clean_telefone(value):
    """
    Remove formatação do telefone, deixando apenas números
    """
    if not value:
        return ''
    
    return re.sub(r'\D', '', str(value))

@register.filter
def multiply(value, arg):
    """Multiplica dois valores"""
    try:
        return float(value) * float(arg)
    except (ValueError, TypeError):
        return 0

@register.filter  
def divide(value, arg):
    """Divide dois valores"""
    try:
        if float(arg) == 0:
            return 0
        return float(value) / float(arg)
    except (ValueError, TypeError):
        return 0

@register.filter
def percentage(value, total):
    """Calcula a porcentagem de um valor em relação ao total"""
    try:
        if float(total) == 0:
            return 0
        return (float(value) / float(total)) * 100
    except (ValueError, TypeError):
        return 0 