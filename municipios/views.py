from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import Municipio
import json

@login_required
def api_municipios(request):
    """
    API para retornar lista de municípios do MS
    """
    if request.method == 'GET':
        # Buscar parâmetro de filtro
        search = request.GET.get('search', '').strip()
        
        # Filtrar municípios
        municipios = Municipio.objects.all()
        
        if search:
            municipios = municipios.filter(nome__icontains=search)
        
        # Limitar resultados
        limit = int(request.GET.get('limit', 20))
        municipios = municipios[:limit]
        
        # Preparar dados para JSON
        data = []
        for municipio in municipios:
            data.append({
                'id': municipio.id,
                'nome': municipio.nome,
                'estado': municipio.estado,
                'texto_completo': f"{municipio.nome} - {municipio.estado}"
            })
        
        return JsonResponse({
            'success': True,
            'municipios': data,
            'total': len(data)
        })
    
    return JsonResponse({
        'success': False,
        'error': 'Método não permitido'
    }, status=405)

@login_required
def api_municipio_por_id(request, municipio_id):
    """
    API para retornar um município específico por ID
    """
    try:
        municipio = Municipio.objects.get(id=municipio_id)
        
        return JsonResponse({
            'success': True,
            'municipio': {
                'id': municipio.id,
                'nome': municipio.nome,
                'estado': municipio.estado,
                'texto_completo': f"{municipio.nome} - {municipio.estado}"
            }
        })
    
    except Municipio.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Município não encontrado'
        }, status=404)

@login_required
def api_municipios_autocomplete(request):
    """
    API para autocomplete dos municípios
    """
    query = request.GET.get('q', '').strip()
    
    if len(query) < 2:
        return JsonResponse({
            'results': []
        })
    
    municipios = Municipio.objects.filter(
        nome__icontains=query
    ).order_by('nome')[:10]
    
    results = []
    for municipio in municipios:
        results.append({
            'id': municipio.nome,  # Usar nome como ID para compatibilidade
            'text': municipio.nome,
            'nome': municipio.nome
        })
    
    return JsonResponse({
        'results': results
    }) 