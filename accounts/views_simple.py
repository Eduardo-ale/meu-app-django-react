from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def home_react_super_simple(request):
    """Página de teste com componente React super simplificado"""
    context = {
        'estatisticas': {
            'total_unidades': 10,
            'total_chamadas': 25,
            'chamadas_hoje': 5,
            'chamadas_mes': 15,
            'executantes': 4,
            'solicitantes': 3,
            'executante_solicitante': 3
        }
    }
    return render(request, 'home_react_super_simple.html', context)

def test_basic_react(request):
    """Teste básico do React sem autenticação"""
    return render(request, 'test_basic_react.html')

@login_required
def home_react_working(request):
    """Dashboard React que funciona com certeza"""
    from .models import RegistroChamada, UnidadeSaude
    from django.utils import timezone
    
    # Estatísticas das unidades de saúde
    total_unidades = UnidadeSaude.objects.count()
    executantes = UnidadeSaude.objects.filter(tipo='UNIDADE_EXECUTANTE').count()
    solicitantes = UnidadeSaude.objects.filter(tipo='UNIDADE_SOLICITANTE').count()
    executante_solicitante = UnidadeSaude.objects.filter(tipo='EXECUTANTE_SOLICITANTE').count()
    
    # Estatísticas das chamadas
    total_chamadas = RegistroChamada.objects.count()
    chamadas_hoje = RegistroChamada.objects.filter(
        data_criacao__date=timezone.now().date()
    ).count()
    chamadas_mes = RegistroChamada.objects.filter(
        data_criacao__month=timezone.now().month,
        data_criacao__year=timezone.now().year
    ).count()
    
    context = {
        'estatisticas': {
            'total_unidades': total_unidades,
            'executantes': executantes,
            'solicitantes': solicitantes,
            'executante_solicitante': executante_solicitante,
            'total_chamadas': total_chamadas,
            'chamadas_hoje': chamadas_hoje,
            'chamadas_mes': chamadas_mes,
        }
    }
    
    return render(request, 'home_react_working.html', context)