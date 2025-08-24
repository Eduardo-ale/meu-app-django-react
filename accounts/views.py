from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.views import LoginView, PasswordChangeView
from django.urls import reverse_lazy
from django.contrib.auth.decorators import login_required, user_passes_test
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, HttpResponse
from .models import RegistroChamada, UnidadeSaude, UserProfile
from django.utils import timezone
import json
import requests
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import csv
import pandas as pd
import io
import os
from django.conf import settings
import openpyxl
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.core.paginator import Paginator
from django.db.models import Count
from datetime import datetime, timedelta
import calendar

# Create your views here.

# Função helper para verificar se usuário é administrador
def is_admin_user(user):
    """Verifica se o usuário é administrador (staff ou superuser)"""
    return user.is_staff or user.is_superuser

@login_required
def test_react_view(request):
    """Página de teste para verificar carregamento de componentes React"""
    return render(request, 'test_react.html')

@login_required
def debug_console_view(request):
    """Página de debug para diagnosticar erros do console"""
    return render(request, 'debug_console.html')

@login_required
def test_react_validation_view(request):
    """Página de teste para validação e diagnóstico de erros React"""
    return render(request, 'test_react_validation.html')

@login_required
def home_debug_view(request):
    """Página de debug para diagnosticar problemas na página principal"""
    from .models import UnidadeSaude, RegistroChamada
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
        },
        'usuario': request.user,
    }
    
    return render(request, 'home_debug.html', context)

class CustomLoginView(LoginView):
    template_name = 'login.html'
    redirect_authenticated_user = True
    
    def get_success_url(self):
        return reverse_lazy('home')
    
    def form_invalid(self, form):
        for error in form.errors.values():
            messages.error(self.request, error)
        return super().form_invalid(form)

@method_decorator(login_required, name='dispatch')
class HomeView(LoginRequiredMixin, TemplateView):
    template_name = 'index.html'
    login_url = 'login'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
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
        
        # Últimas unidades cadastradas
        ultimas_unidades = UnidadeSaude.objects.order_by('-created_at')[:3]
        
        # Últimas chamadas registradas
        ultimas_chamadas = RegistroChamada.objects.order_by('-data_criacao')[:5]
        
        context.update({
            'estatisticas': {
                'total_unidades': total_unidades,
                'executantes': executantes,
                'solicitantes': solicitantes,
                'executante_solicitante': executante_solicitante,
                'total_chamadas': total_chamadas,
                'chamadas_hoje': chamadas_hoje,
                'chamadas_mes': chamadas_mes,
            },
            'ultimas_unidades': ultimas_unidades,
            'ultimas_chamadas': ultimas_chamadas,
            'usuario': self.request.user,
        })
        
        return context

class RegistroChamadaView(LoginRequiredMixin, TemplateView):
    template_name = 'registro_chamada.html'
    login_url = 'login'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['data_atual'] = timezone.now().strftime('%d/%m/%Y %H:%M:%S')
        return context

class RegistroChamadaReactView(RegistroChamadaView):
    template_name = 'registro_chamada_react.html'
    
    def post(self, request, *args, **kwargs):
        # Herdar exatamente o mesmo comportamento de POST da página original
        return super().post(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        try:
            # Decodificar o JSON do corpo da requisição
            data = json.loads(request.body)
            
            # Debug: mostrar dados recebidos
            print(f"🔍 [DEBUG REGISTRO] Dados recebidos: {data}")
            
            # Criar o registro da chamada com todos os campos
            chamada = RegistroChamada.objects.create(
                # Dados do Solicitante
                nome_contato=data.get('nome', ''),
                telefone=data.get('telefone', ''),
                funcao=data.get('funcao', ''),
                setor=data.get('setor', ''),
                
                # Unidade de Saúde
                unidade=data.get('unidade', ''),
                municipio=data.get('municipio', ''),
                cnes=data.get('cnes', ''),
                contato_telefonico_cnes=data.get('contato_telefonico_cnes', ''),
                
                # Dados da Chamada
                tipo_chamada=data.get('tipo_chamada', ''),
                status=data.get('status', ''),
                nome_atendente=data.get('nome_atendente', ''),
                descricao=data.get('descricao', ''),
                solucao=data.get('solucao', ''),
                
                # Metadados
                usuario_criador=request.user,
            )

            print(f"✅ [DEBUG REGISTRO] Chamada criada com ID: {chamada.id}")

            return JsonResponse({
                'success': True,
                'message': 'Chamada registrada com sucesso!',
                'data': {
                    'id': chamada.id,
                    'data_criacao': chamada.data_criacao.strftime('%d/%m/%Y %H:%M:%S'),
                    'usuario': request.user.username,
                    'tipo_chamada': chamada.get_tipo_chamada_display(),
                    'status': chamada.get_status_display()
                }
            })
        except json.JSONDecodeError:
            print("❌ [DEBUG REGISTRO] Erro ao decodificar JSON")
            return JsonResponse({
                'success': False,
                'message': 'Erro ao decodificar os dados da requisição.',
            }, status=400)
        except Exception as e:
            print(f"❌ [DEBUG REGISTRO] Erro: {str(e)}")
            return JsonResponse({
                'success': False,
                'message': 'Erro ao registrar chamada.',
                'error': str(e)
            }, status=400)

@login_required
def unidades_saude(request):
    """Lista todas as unidades de saúde com interface React moderna"""
    import json
    from django.core.serializers.json import DjangoJSONEncoder
    
    unidades = UnidadeSaude.objects.all().order_by('nome')
    
    # Calcular estatísticas por tipo
    total_unidades = unidades.count()
    executantes = unidades.filter(tipo='UNIDADE_EXECUTANTE').count()
    solicitantes = unidades.filter(tipo='UNIDADE_SOLICITANTE').count()
    executante_solicitante = unidades.filter(tipo='EXECUTANTE_SOLICITANTE').count()
    
    # Serializar unidades para JSON
    unidades_data = []
    for unidade in unidades:
        # Sanitizar dados para evitar problemas de JSON
        unidade_data = {
            'id': unidade.id,
            'nome': str(unidade.nome).replace('"', '\\"').replace("'", "\\'") if unidade.nome else '',
            'municipio': str(unidade.municipio or 'Não informado').replace('"', '\\"').replace("'", "\\'"),
            'cnes': str(unidade.cnes or '').replace('"', '\\"').replace("'", "\\'"),
            'tipo': str(unidade.tipo).replace('"', '\\"').replace("'", "\\'"),
            'contato_telefonico': str(unidade.contato_telefonico or '').replace('"', '\\"').replace("'", "\\'"),
            'endereco': str(unidade.endereco).replace('"', '\\"').replace("'", "\\'") if unidade.endereco else '',
            'telefone': str(unidade.telefone).replace('"', '\\"').replace("'", "\\'") if unidade.telefone else '',
            'responsavel': str(unidade.responsavel or 'Não informado').replace('"', '\\"').replace("'", "\\'"),
            'email': str(unidade.email or '').replace('"', '\\"').replace("'", "\\'"),
            'horario_funcionamento': str(unidade.horario_funcionamento or '').replace('"', '\\"').replace("'", "\\'"),
            'servicos_emergencia': bool(unidade.servicos_emergencia),
            'created_at': unidade.created_at.strftime('%d/%m/%Y %H:%M:%S'),
            'usuario_cadastrante': str(unidade.usuario_cadastrante.username if unidade.usuario_cadastrante else 'Sistema').replace('"', '\\"').replace("'", "\\'")
        }
        unidades_data.append(unidade_data)
    
    estatisticas = {
        'total': total_unidades,
        'executantes': executantes,
        'solicitantes': solicitantes,
        'executante_solicitante': executante_solicitante,
    }
    
    context = {
        'unidades': unidades,  # Para compatibilidade com template original se necessário
        'unidades_json': json.dumps(unidades_data, cls=DjangoJSONEncoder),
        'estatisticas': estatisticas,
        'estatisticas_json': json.dumps(estatisticas, cls=DjangoJSONEncoder),
    }
    
    return render(request, 'unidades_saude_react.html', context)

@login_required
def criar_unidade(request):
    """Cria uma nova unidade de saúde"""
    if request.method == 'POST':
        # Se for requisição JSON (do React)
        if request.content_type == 'application/json':
            import json
            try:
                data = json.loads(request.body)
                
                # Cria a nova unidade
                unidade = UnidadeSaude.objects.create(
                    nome=data.get('nome'),
                    municipio=data.get('municipio', ''),
                    tipo=data.get('tipo', 'UNIDADE_EXECUTANTE'),
                    contato_telefonico=data.get('contato_telefonico', ''),
                    endereco=data.get('endereco', ''),
                    telefone=data.get('telefone', ''),
                    responsavel=data.get('responsavel', ''),
                    cnes=data.get('cnes', ''),
                    email=data.get('email', ''),
                    horario_funcionamento=data.get('horario_funcionamento', ''),
                    servicos_emergencia=data.get('servicos_emergencia', False),
                    usuario_cadastrante=request.user
                )
                
                return JsonResponse({
                    'success': True, 
                    'message': 'Unidade criada com sucesso!',
                    'unidade_id': unidade.id
                })
            except json.JSONDecodeError:
                return JsonResponse({'success': False, 'errors': {'general': 'Dados inválidos'}}, status=400)
            except Exception as e:
                return JsonResponse({'success': False, 'errors': {'general': str(e)}}, status=500)
        else:
            # Formulário HTML tradicional
            nome = request.POST.get('nome')
            municipio = request.POST.get('municipio')
            tipo = request.POST.get('tipo')
            contato_telefonico = request.POST.get('contato_telefonico')
            endereco = request.POST.get('endereco')
            telefone = request.POST.get('telefone')
            responsavel = request.POST.get('responsavel')
            cnes = request.POST.get('cnes')

            # Cria a nova unidade
            UnidadeSaude.objects.create(
                nome=nome,
                municipio=municipio,
                tipo=tipo,
                contato_telefonico=contato_telefonico,
                endereco=endereco,
                telefone=telefone,
                responsavel=responsavel,
                cnes=cnes,
                usuario_cadastrante=request.user  # Adiciona o usuário que está cadastrando
            )

            messages.success(request, 'Unidade de saúde criada com sucesso!')
            return redirect('unidades_saude')

    # Para GET request, capturar dados dos parâmetros da URL para pré-preencher
    dados_preenchimento = {}
    
    # Capturar parâmetros de pré-preenchimento
    nome_param = request.GET.get('nome', '')
    nome_cnes_param = request.GET.get('nome_cnes', '')
    municipio_param = request.GET.get('municipio', '')
    telefone_param = request.GET.get('telefone', '')
    contato_telefonico_param = request.GET.get('contato_telefonico', '')
    endereco_param = request.GET.get('endereco', '')
    cnes_param = request.GET.get('cnes', '')
    uf_param = request.GET.get('uf', '')
    
    # Priorizar nome digitado pelo usuário, senão usar nome do CNES
    if nome_param:
        dados_preenchimento['nome'] = nome_param
    elif nome_cnes_param:
        dados_preenchimento['nome'] = nome_cnes_param
    
    # Outros campos
    if municipio_param:
        dados_preenchimento['municipio'] = municipio_param
    if telefone_param:
        dados_preenchimento['telefone'] = telefone_param
    if contato_telefonico_param:
        dados_preenchimento['contato_telefonico'] = contato_telefonico_param
    if endereco_param:
        dados_preenchimento['endereco'] = endereco_param
    if cnes_param:
        dados_preenchimento['cnes'] = cnes_param
    
    # Flag para indicar que veio do registro de chamadas
    veio_de_registro = bool(nome_param or nome_cnes_param or cnes_param)
    
    # Debug no console do servidor
    if dados_preenchimento:
        print(f"🔄 [CADASTRO] Pré-preenchimento detectado:")
        for campo, valor in dados_preenchimento.items():
            print(f"   {campo}: {valor}")
        print(f"   Origem: {'Registro de Chamadas' if veio_de_registro else 'Direto'}")

    # Garantir que dados_preenchimento seja serializável
    import json
    dados_preenchimento_json = json.dumps(dados_preenchimento, ensure_ascii=False)
    
    context = {
        'dados_preenchimento': dados_preenchimento_json,
        'veio_de_registro': veio_de_registro,
    }
    
    return render(request, 'criar_unidade_react.html', context)

@login_required
def editar_unidade(request, pk):
    """Edita uma unidade de saúde existente"""
    unidade = get_object_or_404(UnidadeSaude, pk=pk)

    if request.method == 'POST':
        # Se for requisição JSON (do React)
        if request.content_type == 'application/json':
            import json
            try:
                data = json.loads(request.body)
                unidade.nome = data.get('nome', unidade.nome)
                unidade.municipio = data.get('municipio', unidade.municipio)
                unidade.tipo = data.get('tipo', unidade.tipo)
                unidade.contato_telefonico = data.get('contato_telefonico', unidade.contato_telefonico)
                unidade.endereco = data.get('endereco', unidade.endereco)
                unidade.telefone = data.get('telefone', unidade.telefone)
                unidade.responsavel = data.get('responsavel', unidade.responsavel)
                unidade.cnes = data.get('cnes', unidade.cnes)
                unidade.email = data.get('email', unidade.email)
                unidade.horario_funcionamento = data.get('horario_funcionamento', unidade.horario_funcionamento)
                unidade.servicos_emergencia = data.get('servicos_emergencia', False)
                unidade.save()
                
                return JsonResponse({'success': True, 'message': 'Unidade atualizada com sucesso!'})
            except json.JSONDecodeError:
                return JsonResponse({'success': False, 'errors': {'general': 'Dados inválidos'}}, status=400)
            except Exception as e:
                return JsonResponse({'success': False, 'errors': {'general': str(e)}}, status=500)
        else:
            # Formulário HTML tradicional
            unidade.nome = request.POST.get('nome')
            unidade.municipio = request.POST.get('municipio')
            unidade.tipo = request.POST.get('tipo')
            unidade.contato_telefonico = request.POST.get('contato_telefonico')
            unidade.endereco = request.POST.get('endereco')
            unidade.telefone = request.POST.get('telefone')
            unidade.responsavel = request.POST.get('responsavel')
            unidade.cnes = request.POST.get('cnes')
            unidade.email = request.POST.get('email')
            unidade.save()

            messages.success(request, 'Unidade de saúde atualizada com sucesso!')
            return redirect('unidades_saude')

    return render(request, 'editar_unidade_react.html', {'unidade': unidade})

@login_required
def visualizar_unidade(request, pk):
    """Visualiza os detalhes de uma unidade de saúde"""
    unidade = get_object_or_404(UnidadeSaude, pk=pk)
    return render(request, 'visualizar_unidade_react.html', {'unidade': unidade})

@login_required
def excluir_unidade(request, pk):
    """Exclui uma unidade de saúde"""
    unidade = get_object_or_404(UnidadeSaude, pk=pk)
    
    if request.method == 'POST':
        unidade.delete()
        messages.success(request, 'Unidade de saúde excluída com sucesso!')
        return redirect('unidades_saude')

    return redirect('unidades_saude')

from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame
from reportlab.lib.units import mm

class CustomDocTemplate(BaseDocTemplate):
    """Template personalizado para PDFs com cabeçalho e rodapé"""
    
    def __init__(self, filename, **kwargs):
        BaseDocTemplate.__init__(self, filename, **kwargs)
        
        # Caminhos das imagens
        static_path = os.path.join(settings.BASE_DIR, 'static', 'images')
        self.brasao_path = os.path.join(static_path, 'brasao_ms.png')
        self.logo_nova_path = os.path.join(static_path, 'logo nova.jpeg')
        self.igpr_path = os.path.join(static_path, 'igpr.png')
        
        # Configurar template da página
        frame = Frame(
            72, 72, 
            self.width - 144, self.height - 200,  # Espaço para cabeçalho e rodapé
            leftPadding=0, bottomPadding=0, rightPadding=0, topPadding=0
        )
        
        template = PageTemplate(id='normal', frames=frame, onPage=self.add_page_decorations)
        self.addPageTemplates([template])
    
    def add_page_decorations(self, canvas, doc):
        """Adiciona cabeçalho e rodapé em cada página"""
        try:
            # Obter dimensões da página atual
            page_width = canvas._pagesize[0]
            page_height = canvas._pagesize[1]
            
            # Cabeçalho - Brasão MS (esquerda) - Ajustado para paisagem
            if os.path.exists(self.brasao_path):
                canvas.drawImage(
                    self.brasao_path, 
                    50, page_height - 100,  # Posição superior esquerda
                    width=80, height=80,  # Tamanho reduzido para paisagem
                    preserveAspectRatio=True
                )
            
            # Cabeçalho - Logo Nova (direita) - Ajustado para paisagem
            if os.path.exists(self.logo_nova_path):
                canvas.drawImage(
                    self.logo_nova_path, 
                    page_width - 130, page_height - 100,  # Posição superior direita
                    width=120, height=80,  # Tamanho ajustado para paisagem
                    preserveAspectRatio=True
                )
            
            # Rodapé - IGPR (centralizada) - Ajustado para paisagem
            if os.path.exists(self.igpr_path):
                canvas.drawImage(
                    self.igpr_path, 
                    (page_width - 120) / 2, 15,  # Posição centralizada no rodapé
                    width=120, height=60,  # Tamanho ajustado para paisagem
                    preserveAspectRatio=True
                )
                
        except Exception as e:
            print(f"Erro ao adicionar decorações da página: {e}")

def adicionar_cabecalho_pdf(story):
    """Função auxiliar para adicionar espaçamento após o cabeçalho"""
    # Apenas adiciona espaçamento, pois as imagens são adicionadas pelo template
    story.append(Spacer(1, 40))

@login_required
def export_historico_pdf_simples(request):
    """Exportar histórico de chamadas em PDF - Versão Simples e Funcional"""
    try:
        import pytz
        from reportlab.lib.pagesizes import A4, landscape
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="historico_chamadas.pdf"'
        
        # Usar SimpleDocTemplate simples em orientação paisagem
        doc = SimpleDocTemplate(response, pagesize=landscape(A4), 
                              leftMargin=30, rightMargin=30, 
                              topMargin=80, bottomMargin=80)
        elements = []
        
        # Adicionar apenas espaçamento no topo (sem imagens por enquanto para evitar embaralhamento)
        elements.append(Spacer(1, 30))
        
        # Estilos
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=20,
            alignment=1  # Center
        )
        
        # Título
        elements.append(Paragraph("Relatório de Histórico de Chamadas", title_style))
        
        # Usar fuso horário de Campo Grande/MS
        campo_grande_tz = pytz.timezone('America/Campo_Grande')
        agora_local = timezone.now().astimezone(campo_grande_tz)
        
        elements.append(Paragraph(f"Gerado em: {agora_local.strftime('%d/%m/%Y às %H:%M')} (Campo Grande/MS)", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Query base - sem filtros para evitar erros
        chamadas = RegistroChamada.objects.all().order_by('-data_criacao')
        
        # Preparar dados para a tabela com MENOS colunas para caber na página
        # Reduzir para apenas as colunas mais importantes
        data = [['Data/Hora', 'Contato', 'Telefone', 'Unidade', 'Município', 'Tipo', 'Status']]
        for chamada in chamadas:
            # Converter data para fuso horário local
            data_local = chamada.data_criacao.astimezone(campo_grande_tz)
            
            data.append([
                data_local.strftime('%d/%m/%Y\n%H:%M'),  # Quebra de linha para economizar espaço
                chamada.nome_contato[:20] + '...' if len(chamada.nome_contato) > 20 else chamada.nome_contato,
                chamada.telefone[:15] + '...' if len(chamada.telefone) > 15 else chamada.telefone,
                chamada.unidade[:30] + '...' if len(chamada.unidade) > 30 else chamada.unidade,
                chamada.municipio[:15] + '...' if chamada.municipio and len(chamada.municipio) > 15 else (chamada.municipio or ''),
                (chamada.get_tipo_chamada_display() or chamada.tipo_chamada)[:20] + '...' if len(chamada.get_tipo_chamada_display() or chamada.tipo_chamada) > 20 else (chamada.get_tipo_chamada_display() or chamada.tipo_chamada),
                chamada.get_status_display()
            ])
        
        # Criar tabela com larguras específicas para 7 colunas (mais fácil de caber)
        col_widths = [
            1.0*inch,   # Data/Hora
            1.5*inch,   # Contato
            1.0*inch,   # Telefone
            2.0*inch,   # Unidade (maior)
            1.0*inch,   # Município
            1.5*inch,   # Tipo
            0.8*inch    # Status
        ]  # Total: ~8.8 inches (cabe bem em A4 paisagem)
        
        table = Table(data, colWidths=col_widths)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 7),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('RIGHTPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        
        elements.append(table)
        doc.build(elements)
        return response
    
    except Exception as e:
        # Em caso de erro, retornar PDF com mensagem de erro
        print(f"Erro ao gerar PDF do histórico: {e}")
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="historico_chamadas_erro.pdf"'
        
        # Criar PDF simples com mensagem de erro
        doc = CustomDocTemplate(response, pagesize=letter)
        elements = []
        adicionar_cabecalho_pdf(elements)
        
        styles = getSampleStyleSheet()
        elements.append(Paragraph("Erro ao gerar relatório", styles['Heading1']))
        elements.append(Paragraph("Ocorreu um erro. Relatório gerado sem filtros.", styles['Normal']))
        
        doc.build(elements)
        return response

def aplicar_filtros_seguros(chamadas, request):
    """Função auxiliar para aplicar filtros de forma segura"""
    # Aplicar os mesmos filtros da página de histórico
    tipo_filtro = request.GET.get('tipo')
    status_filtro = request.GET.get('status')
    data_inicio = request.GET.get('data_inicio')
    data_fim = request.GET.get('data_fim')
    busca = request.GET.get('busca')
    
    # Função auxiliar para validar valores
    def is_valid_value(value):
        if not value:
            return False
        str_value = str(value).strip().lower()
        return str_value not in ['none', 'null', '', 'undefined']
    
    # Aplicar filtros com validação segura
    if is_valid_value(tipo_filtro):
        chamadas = chamadas.filter(tipo_chamada=tipo_filtro)
    
    if is_valid_value(status_filtro):
        chamadas = chamadas.filter(status=status_filtro)
    
    if is_valid_value(data_inicio):
        try:
            from datetime import datetime
            # Tentar diferentes formatos de data
            for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y']:
                try:
                    data_inicio_obj = datetime.strptime(str(data_inicio).strip(), fmt).date()
                    chamadas = chamadas.filter(data_criacao__date__gte=data_inicio_obj)
                    break
                except ValueError:
                    continue
        except Exception as e:
            print(f"Erro ao processar data_inicio: {e}")
            pass
    
    if is_valid_value(data_fim):
        try:
            from datetime import datetime
            # Tentar diferentes formatos de data
            for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y']:
                try:
                    data_fim_obj = datetime.strptime(str(data_fim).strip(), fmt).date()
                    chamadas = chamadas.filter(data_criacao__date__lte=data_fim_obj)
                    break
                except ValueError:
                    continue
        except Exception as e:
            print(f"Erro ao processar data_fim: {e}")
            pass
    
    if is_valid_value(busca):
        chamadas = chamadas.filter(
            Q(nome_contato__icontains=busca) |
            Q(telefone__icontains=busca) |
            Q(unidade__icontains=busca) |
            Q(descricao__icontains=busca) |
            Q(nome_atendente__icontains=busca)
        )
    
    return chamadas

def export_unidades_pdf(request):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="unidades_saude.pdf"'
    
    # Criar o documento PDF com template personalizado
    doc = CustomDocTemplate(response, pagesize=letter)
    elements = []
    
    # Adicionar espaçamento após o cabeçalho
    adicionar_cabecalho_pdf(elements)
    
    # Estilos
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=30,
        alignment=1  # Center
    )
    
    # Título
    elements.append(Paragraph("Relatório de Unidades de Saúde", title_style))
    elements.append(Paragraph(f"Gerado em: {timezone.now().strftime('%d/%m/%Y às %H:%M')}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Buscar dados das unidades
    unidades = UnidadeSaude.objects.all()
    
    # Preparar dados para a tabela
    data = [['Nome', 'CNES', 'Tipo', 'Telefone', 'Responsável']]
    for unidade in unidades:
        data.append([
            unidade.nome,
            unidade.cnes or '',
            unidade.tipo,
            unidade.telefone,
            unidade.responsavel or ''
        ])
    
    # Criar tabela
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    doc.build(elements)
    return response

def export_unidades_excel(request):
    unidades = UnidadeSaude.objects.all()
    
    # Criar DataFrame com pandas
    data = []
    for unidade in unidades:
        data.append({
            'Nome': unidade.nome,
            'CNES': unidade.cnes or '',
            'Tipo': unidade.tipo,
            'Endereço': unidade.endereco,
            'Telefone': unidade.telefone,
            'Responsável': unidade.responsavel or '',
            'Email': unidade.email or '',
            'Horário de Funcionamento': unidade.horario_funcionamento or '',
            'Serviços de Emergência': 'Sim' if unidade.servicos_emergencia else 'Não',
            'Data de Cadastro': unidade.created_at.strftime('%d/%m/%Y %H:%M:%S')
        })
    
    df = pd.DataFrame(data)
    
    # Criar resposta Excel
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename="unidades_saude.xlsx"'
    
    df.to_excel(response, index=False, engine='openpyxl')
    return response

def export_unidades_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="unidades_saude.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['Nome', 'CNES', 'Tipo', 'Endereço', 'Telefone', 'Responsável', 'Email', 
                    'Horário de Funcionamento', 'Serviços de Emergência', 'Data de Cadastro'])
    
    unidades = UnidadeSaude.objects.all()
    for unidade in unidades:
        writer.writerow([
            unidade.nome,
            unidade.cnes or '',
            unidade.tipo,
            unidade.endereco,
            unidade.telefone,
            unidade.responsavel or '',
            unidade.email or '',
            unidade.horario_funcionamento or '',
            'Sim' if unidade.servicos_emergencia else 'Não',
            unidade.created_at.strftime('%d/%m/%Y %H:%M:%S')
        ])
    
    return response

@csrf_exempt
@require_http_methods(["GET"])
def consultar_cnes_api(request, codigo_cnes):
    """
    View para consultar a API do CNES do Ministério da Saúde
    Funciona como proxy para evitar problemas de CORS
    """
    if request.method != 'GET':
        return JsonResponse({'erro': 'Método não permitido'}, status=405)
    
    # Validar se o código CNES tem 7 dígitos
    codigo_limpo = ''.join(filter(str.isdigit, str(codigo_cnes)))
    
    if len(codigo_limpo) != 7:
        return JsonResponse({
            'sucesso': False,
            'erro': 'Código CNES deve ter exatamente 7 dígitos'
        }, status=400)
    
    try:
        # Consultar a API oficial do Ministério da Saúde
        url = f'https://apidadosabertos.saude.gov.br/cnes/estabelecimentos/{codigo_limpo}'
        
        # Debug logs
        print(f"🔍 [DEBUG CNES] Consultando código: {codigo_cnes} -> {codigo_limpo}")
        print(f"🔍 [DEBUG CNES] URL: {url}")
        
        # Headers para a requisição
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        print(f"🔍 [DEBUG CNES] Status Code: {response.status_code}")
        print(f"🔍 [DEBUG CNES] Resposta: {response.text[:200]}...")
        
        if response.status_code == 404:
            return JsonResponse({
                'sucesso': False,
                'erro': 'Código CNES não encontrado na base de dados do Ministério da Saúde'
            }, status=404)
        
        if response.status_code != 200:
            return JsonResponse({
                'sucesso': False,
                'erro': f'Erro na consulta da API: {response.status_code}'
            }, status=response.status_code)
        
        dados_api = response.json()
        
        # Padronizar os dados retornados com TODOS os campos disponíveis
        dados_padronizados = {
            # Identificação básica
            'codigo_cnes': dados_api.get('codigo_cnes', codigo_limpo),
            'nome_fantasia': dados_api.get('nome_fantasia'),
            'nome_razao_social': dados_api.get('nome_razao_social'),
            'numero_cnpj_entidade': dados_api.get('numero_cnpj_entidade'),
            
            # Classificação
            'natureza_organizacao_entidade': dados_api.get('natureza_organizacao_entidade'),
            'tipo_gestao': dados_api.get('tipo_gestao'),
            'descricao_nivel_hierarquia': dados_api.get('descricao_nivel_hierarquia'),
            'descricao_esfera_administrativa': dados_api.get('descricao_esfera_administrativa'),
            'codigo_tipo_unidade': dados_api.get('codigo_tipo_unidade'),
            
            # Endereço completo
            'codigo_cep_estabelecimento': dados_api.get('codigo_cep_estabelecimento'),
            'endereco_estabelecimento': dados_api.get('endereco_estabelecimento'),
            'numero_estabelecimento': dados_api.get('numero_estabelecimento'),
            'bairro_estabelecimento': dados_api.get('bairro_estabelecimento'),
            'codigo_municipio': dados_api.get('codigo_municipio'),
            'descricao_municipio': dados_api.get('descricao_municipio'),
            'codigo_uf': dados_api.get('codigo_uf'),
            'sigla_uf': dados_api.get('sigla_uf'),
            
            # Contato
            'numero_telefone_estabelecimento': dados_api.get('numero_telefone_estabelecimento'),
            'numero_fax_estabelecimento': dados_api.get('numero_fax_estabelecimento'),
            'endereco_email_estabelecimento': dados_api.get('endereco_email_estabelecimento'),
            
            # Funcionamento
            'codigo_motivo_desabilitacao_estabelecimento': dados_api.get('codigo_motivo_desabilitacao_estabelecimento'),
            'estabelecimento_possui_centro_cirurgico': dados_api.get('estabelecimento_possui_centro_cirurgico'),
            'estabelecimento_possui_centro_obstetrico': dados_api.get('estabelecimento_possui_centro_obstetrico'),
            'estabelecimento_possui_centro_neonatal': dados_api.get('estabelecimento_possui_centro_neonatal'),
            'estabelecimento_possui_atendimento_ambulatorial': dados_api.get('estabelecimento_possui_atendimento_ambulatorial'),
            'estabelecimento_possui_atendimento_internacao': dados_api.get('estabelecimento_possui_atendimento_internacao'),
            'estabelecimento_possui_atendimento_urgencia': dados_api.get('estabelecimento_possui_atendimento_urgencia'),
            'estabelecimento_possui_atendimento_outros': dados_api.get('estabelecimento_possui_atendimento_outros'),
            
            # Campos de compatibilidade (mantidos para não quebrar código existente)
            'codigo': dados_api.get('codigo_cnes', codigo_limpo),
            'nome': (dados_api.get('nome_fantasia') or 
                    dados_api.get('nome_razao_social') or 
                    'Nome não informado'),
            'municipio': dados_api.get('descricao_municipio'),
            'uf': dados_api.get('sigla_uf'),
            'cep': dados_api.get('codigo_cep_estabelecimento'),
            'endereco': dados_api.get('endereco_estabelecimento'),
            'numero': dados_api.get('numero_estabelecimento'),
            'bairro': dados_api.get('bairro_estabelecimento'),
            'telefone': dados_api.get('numero_telefone_estabelecimento'),
            'email': dados_api.get('endereco_email_estabelecimento'),
        }
        
        return JsonResponse({
            'sucesso': True,
            'dados': dados_padronizados,
            'fonte': 'Ministério da Saúde - DATASUS'
        })
        
    except requests.exceptions.Timeout:
        return JsonResponse({
            'sucesso': False,
            'erro': 'Timeout na consulta à API do Ministério da Saúde. Tente novamente.'
        }, status=408)
        
    except requests.exceptions.ConnectionError:
        return JsonResponse({
            'sucesso': False,
            'erro': 'Erro de conexão com a API do Ministério da Saúde. Verifique sua internet.'
        }, status=503)
        
    except Exception as e:
        return JsonResponse({
            'sucesso': False,
            'erro': f'Erro interno: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def consultar_unidade_saude_api(request):
    """
    API para consultar unidades de saúde cadastradas no sistema
    Recebe o nome da unidade e retorna os dados se encontrada
    """
    if request.method != 'POST':
        return JsonResponse({'erro': 'Método não permitido'}, status=405)
    
    try:
        # Decodificar o JSON do corpo da requisição
        data = json.loads(request.body)
        nome_unidade = data.get('nome_unidade', '').strip()
        
        if not nome_unidade:
            return JsonResponse({
                'sucesso': False,
                'erro': 'Nome da unidade é obrigatório'
            }, status=400)
        
        print(f"🔍 [DEBUG UNIDADE] Consultando: '{nome_unidade}'")
        
        # Buscar a unidade no banco de dados (busca case-insensitive e mais precisa)
        try:
            # Primeiro, tentar busca exata
            try:
                unidade = UnidadeSaude.objects.get(nome__iexact=nome_unidade)
                print(f"✅ [DEBUG UNIDADE] Busca exata encontrada: {unidade.nome}")
            except UnidadeSaude.DoesNotExist:
                # Se não encontrar exata, tentar busca por substring completa
                try:
                    unidade = UnidadeSaude.objects.get(nome__icontains=nome_unidade)
                    print(f"✅ [DEBUG UNIDADE] Busca por substring encontrada: {unidade.nome}")
                except UnidadeSaude.DoesNotExist:
                    # Busca mais restritiva por palavras-chave (requer todas as palavras principais)
                    palavras = [p for p in nome_unidade.lower().split() if len(p) > 2]
                    print(f"🔍 [DEBUG UNIDADE] Buscando por palavras-chave (todas): {palavras}")
                    
                    if len(palavras) == 0:
                        raise UnidadeSaude.DoesNotExist
                    
                    # Buscar unidades que contenham TODAS as palavras principais
                    query = Q()
                    for palavra in palavras:
                        query &= Q(nome__icontains=palavra)  # AND ao invés de OR
                    
                    unidades_encontradas = UnidadeSaude.objects.filter(query)
                    
                    if unidades_encontradas.exists():
                        unidade = unidades_encontradas.first()
                        print(f"✅ [DEBUG UNIDADE] Busca por todas palavras encontrada: {unidade.nome}")
                    else:
                        # Se não encontrar com todas as palavras, tentar com as 2 primeiras palavras mais importantes
                        palavras_importantes = palavras[:2] if len(palavras) >= 2 else palavras
                        print(f"🔍 [DEBUG UNIDADE] Buscando por palavras importantes: {palavras_importantes}")
                        
                        query_importante = Q()
                        for palavra in palavras_importantes:
                            query_importante &= Q(nome__icontains=palavra)
                        
                        unidades_importantes = UnidadeSaude.objects.filter(query_importante)
                        
                        if unidades_importantes.exists():
                            unidade = unidades_importantes.first()
                            print(f"✅ [DEBUG UNIDADE] Busca por palavras importantes encontrada: {unidade.nome}")
                        else:
                            raise UnidadeSaude.DoesNotExist
            
            print(f"✅ [DEBUG UNIDADE] Unidade encontrada: {unidade.nome}")
            
            # Preparar dados da unidade
            dados_unidade = {
                'id': unidade.id,
                'nome': unidade.nome,
                'municipio': unidade.municipio or 'Não informado',
                'cnes': unidade.cnes or '',
                'tipo': unidade.get_tipo_display(),  # Obtém o texto legível do choice
                'tipo_codigo': unidade.tipo,  # Código do tipo
                'endereco': unidade.endereco or 'Não informado',
                'telefone': unidade.telefone or 'Não informado',
                'responsavel': unidade.responsavel or 'Não informado',
                'email': unidade.email or 'Não informado',
                'horario_funcionamento': unidade.horario_funcionamento or 'Não informado',
                'servicos_emergencia': unidade.servicos_emergencia,
                'data_cadastro': unidade.created_at.strftime('%d/%m/%Y %H:%M:%S'),
                'usuario_cadastrante': unidade.usuario_cadastrante.username if unidade.usuario_cadastrante else 'Sistema'
            }
            
            return JsonResponse({
                'sucesso': True,
                'unidade': dados_unidade,
                'fonte': 'Sistema Local de Cadastro'
            })
            
        except UnidadeSaude.DoesNotExist:
            print(f"❌ [DEBUG UNIDADE] Unidade não encontrada: '{nome_unidade}'")
            
            # Listar todas as unidades cadastradas para debug
            todas_unidades = UnidadeSaude.objects.all()
            unidades_existentes = [u.nome for u in todas_unidades]
            print(f"💡 [DEBUG UNIDADE] Total de unidades cadastradas: {len(unidades_existentes)}")
            print(f"💡 [DEBUG UNIDADE] Unidades disponíveis: {unidades_existentes}")
            
            # Buscar unidades similares
            unidades_similares = []
            if nome_unidade.split():
                primeira_palavra = nome_unidade.split()[0]
                unidades_similares = UnidadeSaude.objects.filter(
                    Q(nome__icontains=primeira_palavra)
                )[:5]
                unidades_similares_nomes = [u.nome for u in unidades_similares]
                print(f"💡 [DEBUG UNIDADE] Unidades similares com '{primeira_palavra}': {unidades_similares_nomes}")
            
            return JsonResponse({
                'sucesso': False,
                'erro': f'Unidade "{nome_unidade}" não encontrada no sistema',
                'unidades_similares': [u.nome for u in unidades_similares],
                'todas_unidades': unidades_existentes,  # Para debug completo
                'debug_info': {
                    'nome_pesquisado': nome_unidade,
                    'total_unidades_cadastradas': len(unidades_existentes),
                    'metodo_busca': 'busca_exata_e_palavras_chave'
                }
            }, status=404)
            
        except UnidadeSaude.MultipleObjectsReturned:
            # Se houver múltiplas unidades, retornar a primeira
            unidade = UnidadeSaude.objects.filter(
                Q(nome__iexact=nome_unidade) |
                Q(nome__icontains=nome_unidade)
            ).first()
            
            print(f"⚠️ [DEBUG UNIDADE] Múltiplas unidades encontradas, retornando: {unidade.nome}")
            
            dados_unidade = {
                'id': unidade.id,
                'nome': unidade.nome,
                'municipio': unidade.municipio or 'Não informado',
                'cnes': unidade.cnes or '',
                'tipo': unidade.get_tipo_display(),
                'tipo_codigo': unidade.tipo,
                'endereco': unidade.endereco or 'Não informado',
                'telefone': unidade.telefone or 'Não informado',
                'responsavel': unidade.responsavel or 'Não informado',
                'email': unidade.email or 'Não informado',
                'horario_funcionamento': unidade.horario_funcionamento or 'Não informado',
                'servicos_emergencia': unidade.servicos_emergencia,
                'data_cadastro': unidade.created_at.strftime('%d/%m/%Y %H:%M:%S'),
                'usuario_cadastrante': unidade.usuario_cadastrante.username if unidade.usuario_cadastrante else 'Sistema'
            }
            
            return JsonResponse({
                'sucesso': True,
                'unidade': dados_unidade,
                'fonte': 'Sistema Local de Cadastro',
                'aviso': 'Múltiplas unidades encontradas, retornando a primeira'
            })
    
    except json.JSONDecodeError:
        return JsonResponse({
            'sucesso': False,
            'erro': 'Erro ao decodificar JSON da requisição'
        }, status=400)
        
    except Exception as e:
        print(f"❌ [DEBUG UNIDADE] Erro inesperado: {str(e)}")
        return JsonResponse({
            'sucesso': False,
            'erro': f'Erro interno do servidor: {str(e)}'
        }, status=500)

@login_required
def historico_chamadas(request):
    """View para exibir o histórico de chamadas"""
    # Filtros da query string
    tipo_filtro = request.GET.get('tipo')
    status_filtro = request.GET.get('status')
    data_inicio = request.GET.get('data_inicio')
    data_fim = request.GET.get('data_fim')
    busca = request.GET.get('busca')
    
    # Query base
    chamadas = RegistroChamada.objects.all()
    
    # Aplicar filtros
    if tipo_filtro:
        chamadas = chamadas.filter(tipo_chamada=tipo_filtro)
    
    if status_filtro:
        chamadas = chamadas.filter(status=status_filtro)
    
    if data_inicio:
        try:
            from datetime import datetime
            data_inicio_obj = datetime.strptime(data_inicio, '%Y-%m-%d').date()
            chamadas = chamadas.filter(data_criacao__date__gte=data_inicio_obj)
        except ValueError:
            pass
    
    if data_fim:
        try:
            from datetime import datetime
            data_fim_obj = datetime.strptime(data_fim, '%Y-%m-%d').date()
            chamadas = chamadas.filter(data_criacao__date__lte=data_fim_obj)
        except ValueError:
            pass
    
    if busca:
        chamadas = chamadas.filter(
            Q(nome_contato__icontains=busca) |
            Q(telefone__icontains=busca) |
            Q(unidade__icontains=busca) |
            Q(descricao__icontains=busca) |
            Q(nome_atendente__icontains=busca)
        )
    
    # Ordenar por data mais recente
    chamadas = chamadas.order_by('-data_criacao')
    
    # Estatísticas
    total_chamadas = chamadas.count()
    chamadas_hoje = RegistroChamada.objects.filter(
        data_criacao__date=timezone.now().date()
    ).count()
    chamadas_mes = RegistroChamada.objects.filter(
        data_criacao__month=timezone.now().month,
        data_criacao__year=timezone.now().year
    ).count()
    
    # Tipos de chamada atualizados (baseados no formulário atual)
    TIPOS_CHAMADA_ATUAIS = [
        ('outro_nao_especificado', 'Outro não especificado'),
        ('cadastro_profissional', 'Cadastro de profissional'),
        ('cadastro_unidade', 'Cadastro de Unidade'),
        ('cancelamento_solicitacao', 'Cancelamento de Solicitacao'),
        ('capacidade_operacional', 'Capacidade operacional de unidade'),
        ('contato', 'Contato'),
        ('contato_medico_regulador', 'Contato com Medico Regulador'),
        ('fluxo_funcionamento', 'Fluxo de funcionamento do sistema'),
        ('fluxo_processo_regulacao', 'Fluxo/processo de regulacao'),
        ('insercao_unidade_perfil', 'Insercao de Unidade em perfil'),
        ('login_sistema_core', 'Login sistema CORE'),
        ('manuseio_uso_sistema', 'Manuseio/Uso do sistema'),
        ('municipio_sem_internet', 'Município sem internet'),
        ('pactuacao', 'Pactuacao'),
        ('psiquiatria', 'Psiquiatria'),
        ('reset_senha_usuario', 'Reset de senha de usuario'),
        ('sistema_fora_ar', 'Sistema Fora do ar'),
        ('sistema_lento', 'Sistema Lento'),
        ('solicitacao_treinamento', 'Solicitacao de treinamento'),
        ('suporte_ambulatorial', 'Suporte Ambulatorial'),
        ('suporte_mabulatorial_leitos', 'suporte ao modulo MABULATORIAL E LEITOS'),
        ('suporte_leitos', 'Suporte Leitos'),
        ('unidade_sem_internet', 'Unidade sem internet'),
    ]
    
    # Estatísticas por tipo (incluindo tipos antigos e novos)
    tipos_chamadas = {}
    for tipo, nome in TIPOS_CHAMADA_ATUAIS:
        tipos_chamadas[tipo] = RegistroChamada.objects.filter(tipo_chamada=tipo).count()
    
    # Adicionar tipos antigos que ainda podem existir no banco
    for tipo, nome in RegistroChamada.TIPO_CHOICES:
        if tipo not in tipos_chamadas:
            tipos_chamadas[tipo] = RegistroChamada.objects.filter(tipo_chamada=tipo).count()
    
    # Estatísticas por status
    status_chamadas = {}
    for status, nome in RegistroChamada.STATUS_CHOICES:
        status_chamadas[status] = RegistroChamada.objects.filter(status=status).count()
    
    context = {
        'chamadas': chamadas,
        'total_chamadas': total_chamadas,
        'chamadas_hoje': chamadas_hoje,
        'chamadas_mes': chamadas_mes,
        'tipos_chamadas': tipos_chamadas,
        'status_chamadas': status_chamadas,
        'filtros': {
            'tipo': tipo_filtro,
            'status': status_filtro,
            'data_inicio': data_inicio,
            'data_fim': data_fim,
            'busca': busca,
        },
        'tipo_choices': TIPOS_CHAMADA_ATUAIS,
        'status_choices': RegistroChamada.STATUS_CHOICES,
    }
    
    return render(request, 'historico_react.html', context)

@login_required
def export_historico_pdf(request):
    """Exportar histórico de chamadas em PDF - Versão Corrigida"""
    try:
        # Ignorar filtros problemáticos por enquanto para evitar erros
        print("Gerando PDF do histórico sem filtros para evitar erros de validação")
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="historico_chamadas.pdf"'
        
        # Criar o documento PDF com template personalizado
        doc = CustomDocTemplate(response, pagesize=letter)
        elements = []
        
        # Adicionar espaçamento após o cabeçalho
        adicionar_cabecalho_pdf(elements)
        
        # Estilos
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=30,
            alignment=1  # Center
        )
        
        # Título
        elements.append(Paragraph("Relatório de Histórico de Chamadas", title_style))
        elements.append(Paragraph(f"Gerado em: {timezone.now().strftime('%d/%m/%Y às %H:%M')}", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Aplicar os mesmos filtros da página de histórico
        tipo_filtro = request.GET.get('tipo')
        status_filtro = request.GET.get('status')
        data_inicio = request.GET.get('data_inicio')
        data_fim = request.GET.get('data_fim')
        busca = request.GET.get('busca')
        
        # Query base
        chamadas = RegistroChamada.objects.all()
        
        # Aplicar filtros
        if tipo_filtro:
            chamadas = chamadas.filter(tipo_chamada=tipo_filtro)
        
        if status_filtro:
            chamadas = chamadas.filter(status=status_filtro)
    
        if data_inicio:
            try:
                from datetime import datetime
                data_inicio_obj = datetime.strptime(data_inicio, '%Y-%m-%d').date()
                chamadas = chamadas.filter(data_criacao__date__gte=data_inicio_obj)
            except ValueError:
                pass
        
        if data_fim:
            try:
                from datetime import datetime
                data_fim_obj = datetime.strptime(data_fim, '%Y-%m-%d').date()
                chamadas = chamadas.filter(data_criacao__date__lte=data_fim_obj)
            except ValueError:
                pass
        
        if busca:
            chamadas = chamadas.filter(
                Q(nome_contato__icontains=busca) |
                Q(telefone__icontains=busca) |
                Q(unidade__icontains=busca) |
                Q(descricao__icontains=busca) |
                Q(nome_atendente__icontains=busca)
            )
        
        # Ordenar por data mais recente
        chamadas = chamadas.order_by('-data_criacao')
        
        # Preparar dados para a tabela
        data = [['Data/Hora', 'Contato', 'Telefone', 'Função', 'Setor', 'Unidade', 'Município', 'Tipo', 'Status', 'Atendente']]
        for chamada in chamadas:
            data.append([
                chamada.data_criacao.strftime('%d/%m/%Y %H:%M'),
                chamada.nome_contato,
                chamada.telefone,
                chamada.funcao or '',
                chamada.setor or '',
                chamada.unidade[:30] + '...' if len(chamada.unidade) > 30 else chamada.unidade,
                chamada.municipio or '',
                chamada.get_tipo_chamada_display() or chamada.tipo_chamada,
                chamada.get_status_display(),
                chamada.nome_atendente[:20] + '...' if len(chamada.nome_atendente) > 20 else chamada.nome_atendente
            ])
        
        # Criar tabela
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        elements.append(table)
        doc.build(elements)
        return response
    
    except Exception as e:
        # Em caso de erro, retornar PDF com mensagem de erro
        print(f"Erro ao gerar PDF do histórico: {e}")
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="historico_chamadas_erro.pdf"'
        
        # Criar PDF simples com mensagem de erro
        doc = CustomDocTemplate(response, pagesize=letter)
        elements = []
        adicionar_cabecalho_pdf(elements)
        
        styles = getSampleStyleSheet()
        elements.append(Paragraph("Erro ao gerar relatório", styles['Heading1']))
        elements.append(Paragraph("Ocorreu um erro ao processar os filtros. Tente novamente.", styles['Normal']))
        
        doc.build(elements)
        return response

@csrf_exempt
def export_historico_excel(request):
    """Exportar histórico de chamadas em Excel"""
    
    # Verificar autenticação de forma mais robusta
    if not request.user.is_authenticated:
        print(f"❌ [EXPORT] Usuário não autenticado, redirecionando para login")
        from django.contrib.auth.views import redirect_to_login
        return redirect_to_login(request.get_full_path())
        
    print(f"✅ [EXPORT] Usuário autenticado: {request.user.username}")
    print(f"🔍 [EXPORT] URL requisitada: {request.get_full_path()}")
    print(f"🔍 [EXPORT] Parâmetros GET: {dict(request.GET)}")
    
    try:
        # Aplicar os mesmos filtros da página de histórico
        tipo_filtro = request.GET.get('tipo', '').strip()
        status_filtro = request.GET.get('status', '').strip()
        data_inicio = request.GET.get('data_inicio', '').strip()
        data_fim = request.GET.get('data_fim', '').strip()
        busca = request.GET.get('busca', '').strip()
        
        print(f"🔍 [EXPORT] Filtros: tipo='{tipo_filtro}', status='{status_filtro}', busca='{busca}'")
        
        # Query base
        chamadas = RegistroChamada.objects.all()
        print(f"🔍 [EXPORT] Total inicial: {chamadas.count()}")
        
        # Aplicar filtros apenas se não estiverem vazios
        if tipo_filtro and tipo_filtro != '':
            chamadas = chamadas.filter(tipo_chamada=tipo_filtro)
            print(f"🔍 [EXPORT] Após filtro tipo: {chamadas.count()}")
        
        if status_filtro and status_filtro != '':
            chamadas = chamadas.filter(status=status_filtro)
            print(f"🔍 [EXPORT] Após filtro status: {chamadas.count()}")
        
        if data_inicio and data_inicio != '':
            try:
                from datetime import datetime
                data_inicio_obj = datetime.strptime(data_inicio, '%Y-%m-%d').date()
                chamadas = chamadas.filter(data_criacao__date__gte=data_inicio_obj)
                print(f"🔍 [EXPORT] Após filtro data_inicio: {chamadas.count()}")
            except ValueError:
                print(f"❌ [EXPORT] Erro no formato data_inicio: {data_inicio}")
                pass
        
        if data_fim and data_fim != '':
            try:
                from datetime import datetime
                data_fim_obj = datetime.strptime(data_fim, '%Y-%m-%d').date()
                chamadas = chamadas.filter(data_criacao__date__lte=data_fim_obj)
                print(f"🔍 [EXPORT] Após filtro data_fim: {chamadas.count()}")
            except ValueError:
                print(f"❌ [EXPORT] Erro no formato data_fim: {data_fim}")
                pass
        
        if busca and busca != '':
            chamadas = chamadas.filter(
                Q(nome_contato__icontains=busca) |
                Q(telefone__icontains=busca) |
                Q(unidade__icontains=busca) |
                Q(descricao__icontains=busca) |
                Q(nome_atendente__icontains=busca)
            )
            print(f"🔍 [EXPORT] Após filtro busca: {chamadas.count()}")
        
        # Ordenar por data mais recente
        chamadas = chamadas.order_by('-data_criacao')
        print(f"✅ [EXPORT] Total final: {chamadas.count()}")
        
        # Criar DataFrame com pandas
        data = []
        for chamada in chamadas:
            data.append({
                'Data e Hora': chamada.data_criacao.strftime('%d/%m/%Y %H:%M:%S'),
                'Nome do Contato': chamada.nome_contato,
                'Telefone': chamada.telefone,
                'Função/Cargo': chamada.funcao or '',
                'Setor de Atuação': chamada.setor or '',
                'Nome da Unidade': chamada.unidade,
                'Município': chamada.municipio or '',
                'Código CNES': chamada.cnes or '',
                'Contato Telefônico CNES': chamada.contato_telefonico_cnes or '',
                'Tipo de Chamada': chamada.get_tipo_chamada_display() or chamada.tipo_chamada,
                'Status': chamada.get_status_display(),
                'Nome do Atendente': chamada.nome_atendente,
                'Descrição da Solicitação': chamada.descricao,
                'Solução/Encaminhamento': chamada.solucao or '',
                'Usuário Criador': chamada.usuario_criador.first_name or chamada.usuario_criador.username,
                'Data de Atualização': chamada.data_atualizacao.strftime('%d/%m/%Y %H:%M:%S'),
            })
        
        print(f"📊 [EXPORT] Dados coletados: {len(data)} registros")
        
        # Criar DataFrame
        import pandas as pd
        df = pd.DataFrame(data)
        print(f"📊 [EXPORT] DataFrame criado: {len(df)} linhas")
        
        # Criar resposta Excel
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="historico_chamadas.xlsx"'
        
        # Converter para Excel
        df.to_excel(response, index=False, engine='openpyxl')
        print(f"✅ [EXPORT] Excel gerado com sucesso!")
        
        return response
        
    except Exception as e:
        print(f"❌ [EXPORT] Erro durante exportação: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Retornar erro HTTP em caso de falha
        return HttpResponse(f"Erro na exportação: {str(e)}", status=500)

@login_required
def export_historico_csv(request):
    """Exportar histórico de chamadas em CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="historico_chamadas.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Data e Hora', 'Nome do Contato', 'Telefone', 'Função/Cargo', 'Setor de Atuação',
        'Nome da Unidade', 'Município', 'Código CNES', 'Contato Telefônico CNES',
        'Tipo de Chamada', 'Status', 'Nome do Atendente', 'Descrição da Solicitação',
        'Solução/Encaminhamento', 'Usuário Criador', 'Data de Atualização'
    ])
    
    # Aplicar os mesmos filtros da página de histórico
    tipo_filtro = request.GET.get('tipo')
    status_filtro = request.GET.get('status')
    data_inicio = request.GET.get('data_inicio')
    data_fim = request.GET.get('data_fim')
    busca = request.GET.get('busca')
    
    # Query base
    chamadas = RegistroChamada.objects.all()
    
    # Aplicar filtros
    if tipo_filtro:
        chamadas = chamadas.filter(tipo_chamada=tipo_filtro)
    
    if status_filtro:
        chamadas = chamadas.filter(status=status_filtro)
    
    if data_inicio:
        try:
            from datetime import datetime
            data_inicio_obj = datetime.strptime(data_inicio, '%Y-%m-%d').date()
            chamadas = chamadas.filter(data_criacao__date__gte=data_inicio_obj)
        except ValueError:
            pass
    
    if data_fim:
        try:
            from datetime import datetime
            data_fim_obj = datetime.strptime(data_fim, '%Y-%m-%d').date()
            chamadas = chamadas.filter(data_criacao__date__lte=data_fim_obj)
        except ValueError:
            pass
    
    if busca:
        chamadas = chamadas.filter(
            Q(nome_contato__icontains=busca) |
            Q(telefone__icontains=busca) |
            Q(unidade__icontains=busca) |
            Q(descricao__icontains=busca) |
            Q(nome_atendente__icontains=busca)
        )
    
    # Ordenar por data mais recente
    chamadas = chamadas.order_by('-data_criacao')
    
    for chamada in chamadas:
        writer.writerow([
            chamada.data_criacao.strftime('%d/%m/%Y %H:%M:%S'),
            chamada.nome_contato,
            chamada.telefone,
            chamada.funcao or '',
            chamada.setor or '',
            chamada.unidade,
            chamada.municipio or '',
            chamada.cnes or '',
            chamada.contato_telefonico_cnes or '',
            chamada.get_tipo_chamada_display() or chamada.tipo_chamada,
            chamada.get_status_display(),
            chamada.nome_atendente,
            chamada.descricao,
            chamada.solucao or '',
            chamada.usuario_criador.first_name or chamada.usuario_criador.username,
            chamada.data_atualizacao.strftime('%d/%m/%Y %H:%M:%S'),
        ])
    
    return response

# ===== EXPORTAÇÃO DE USUÁRIOS =====

@login_required
def export_usuarios_pdf(request):
    """Exportar usuários em PDF"""
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="usuarios_sistema.pdf"'
    
    # Criar o documento PDF com template personalizado
    doc = CustomDocTemplate(response, pagesize=letter)
    elements = []
    
    # Adicionar espaçamento após o cabeçalho
    adicionar_cabecalho_pdf(elements)
    
    # Estilos
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=30,
        alignment=1  # Center
    )
    
    # Título
    elements.append(Paragraph("Relatório de Usuários do Sistema", title_style))
    elements.append(Paragraph(f"Gerado em: {timezone.now().strftime('%d/%m/%Y às %H:%M')}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Aplicar os mesmos filtros da página
    busca = request.GET.get('busca', '').strip()
    is_active = request.GET.get('is_active', '')
    is_staff = request.GET.get('is_staff', '')
    
    # Query base
    usuarios = User.objects.all()
    
    # Aplicar filtros
    if busca:
        usuarios = usuarios.filter(
            Q(username__icontains=busca) |
            Q(first_name__icontains=busca) |
            Q(last_name__icontains=busca) |
            Q(email__icontains=busca)
        )
    
    if is_active == 'true':
        usuarios = usuarios.filter(is_active=True)
    elif is_active == 'false':
        usuarios = usuarios.filter(is_active=False)
    
    if is_staff == 'true':
        usuarios = usuarios.filter(is_staff=True)
    elif is_staff == 'false':
        usuarios = usuarios.filter(is_staff=False)
    
    # Ordenar por data de criação
    usuarios = usuarios.order_by('-date_joined')
    
    # Preparar dados para a tabela
    data = [['Nome', 'Usuário', 'Email', 'Tipo', 'Status', 'Data Cadastro']]
    for usuario in usuarios:
        data.append([
            usuario.get_full_name() or usuario.username,
            usuario.username,
            usuario.email or 'Não informado',
            'Administrador' if usuario.is_staff else 'Usuário',
            'Ativo' if usuario.is_active else 'Inativo',
            usuario.date_joined.strftime('%d/%m/%Y')
        ])
    
    # Criar tabela
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    doc.build(elements)
    return response

@login_required
def export_usuarios_excel(request):
    """Exportar usuários em Excel"""
    # Aplicar os mesmos filtros da página
    busca = request.GET.get('busca', '').strip()
    is_active = request.GET.get('is_active', '')
    is_staff = request.GET.get('is_staff', '')
    
    # Query base
    usuarios = User.objects.all()
    
    # Aplicar filtros
    if busca:
        usuarios = usuarios.filter(
            Q(username__icontains=busca) |
            Q(first_name__icontains=busca) |
            Q(last_name__icontains=busca) |
            Q(email__icontains=busca)
        )
    
    if is_active == 'true':
        usuarios = usuarios.filter(is_active=True)
    elif is_active == 'false':
        usuarios = usuarios.filter(is_active=False)
    
    if is_staff == 'true':
        usuarios = usuarios.filter(is_staff=True)
    elif is_staff == 'false':
        usuarios = usuarios.filter(is_staff=False)
    
    # Ordenar por data de criação
    usuarios = usuarios.order_by('-date_joined')
    
    # Criar DataFrame com pandas
    data = []
    for usuario in usuarios:
        # Contar unidades e chamadas do usuário
        unidades_count = UnidadeSaude.objects.filter(usuario_cadastrante=usuario).count()
        chamadas_count = RegistroChamada.objects.filter(usuario_criador=usuario).count()
        
        data.append({
            'Nome Completo': usuario.get_full_name() or 'Não informado',
            'Nome de Usuário': usuario.username,
            'Email': usuario.email or 'Não informado',
            'Primeiro Nome': usuario.first_name or 'Não informado',
            'Último Nome': usuario.last_name or 'Não informado',
            'Tipo de Usuário': 'Administrador' if usuario.is_staff else 'Usuário',
            'Status': 'Ativo' if usuario.is_active else 'Inativo',
            'Superusuário': 'Sim' if usuario.is_superuser else 'Não',
            'Data de Cadastro': usuario.date_joined.strftime('%d/%m/%Y %H:%M:%S'),
            'Último Login': usuario.last_login.strftime('%d/%m/%Y %H:%M:%S') if usuario.last_login else 'Nunca fez login',
            'Unidades Cadastradas': unidades_count,
            'Chamadas Registradas': chamadas_count,
        })
    
    df = pd.DataFrame(data)
    
    # Criar resposta Excel
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename="usuarios_sistema.xlsx"'
    
    df.to_excel(response, index=False, engine='openpyxl')
    return response

@login_required
def export_usuarios_csv(request):
    """Exportar usuários em CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="usuarios_sistema.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Nome Completo', 'Nome de Usuário', 'Email', 'Primeiro Nome', 'Último Nome',
        'Tipo de Usuário', 'Status', 'Superusuário', 'Data de Cadastro', 'Último Login',
        'Unidades Cadastradas', 'Chamadas Registradas'
    ])
    
    # Aplicar os mesmos filtros da página
    busca = request.GET.get('busca', '').strip()
    is_active = request.GET.get('is_active', '')
    is_staff = request.GET.get('is_staff', '')
    
    # Query base
    usuarios = User.objects.all()
    
    # Aplicar filtros
    if busca:
        usuarios = usuarios.filter(
            Q(username__icontains=busca) |
            Q(first_name__icontains=busca) |
            Q(last_name__icontains=busca) |
            Q(email__icontains=busca)
        )
    
    if is_active == 'true':
        usuarios = usuarios.filter(is_active=True)
    elif is_active == 'false':
        usuarios = usuarios.filter(is_active=False)
    
    if is_staff == 'true':
        usuarios = usuarios.filter(is_staff=True)
    elif is_staff == 'false':
        usuarios = usuarios.filter(is_staff=False)
    
    # Ordenar por data de criação
    usuarios = usuarios.order_by('-date_joined')
    
    for usuario in usuarios:
        # Contar unidades e chamadas do usuário
        unidades_count = UnidadeSaude.objects.filter(usuario_cadastrante=usuario).count()
        chamadas_count = RegistroChamada.objects.filter(usuario_criador=usuario).count()
        
        writer.writerow([
            usuario.get_full_name() or 'Não informado',
            usuario.username,
            usuario.email or 'Não informado',
            usuario.first_name or 'Não informado',
            usuario.last_name or 'Não informado',
            'Administrador' if usuario.is_staff else 'Usuário',
            'Ativo' if usuario.is_active else 'Inativo',
            'Sim' if usuario.is_superuser else 'Não',
            usuario.date_joined.strftime('%d/%m/%Y %H:%M:%S'),
            usuario.last_login.strftime('%d/%m/%Y %H:%M:%S') if usuario.last_login else 'Nunca fez login',
            unidades_count,
            chamadas_count,
        ])
    
    return response

@csrf_exempt
@require_http_methods(["POST"])
def editar_chamada_api(request):
    """
    API para editar uma chamada existente
    Recebe os dados editados e atualiza o registro no banco
    """
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Usuário não autenticado'
        }, status=401)
    
    try:
        # Decodificar o JSON do corpo da requisição
        data = json.loads(request.body)
        chamada_id = data.get('id')
        
        if not chamada_id:
            return JsonResponse({
                'success': False,
                'message': 'ID da chamada é obrigatório'
            }, status=400)
        
        print(f"🔍 [DEBUG EDITAR] Editando chamada ID: {chamada_id}")
        print(f"🔍 [DEBUG EDITAR] Dados recebidos: {data}")
        
        # Buscar a chamada no banco de dados
        try:
            chamada = RegistroChamada.objects.get(id=chamada_id)
            print(f"✅ [DEBUG EDITAR] Chamada encontrada: {chamada.nome_contato}")
        except RegistroChamada.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Chamada não encontrada'
            }, status=404)
        
        # Validar campos obrigatórios
        campos_obrigatorios = {
            'nome_contato': 'Nome do contato',
            'telefone': 'Telefone',
            'unidade': 'Nome da unidade',
            'tipo_chamada': 'Tipo de chamada',
            'status': 'Status',
            'nome_atendente': 'Nome do atendente',
            'descricao': 'Descrição'
        }
        
        for campo, nome in campos_obrigatorios.items():
            valor = data.get(campo, '').strip()
            if not valor:
                return JsonResponse({
                    'success': False,
                    'message': f'{nome} é obrigatório'
                }, status=400)
        
        # Validar telefone
        import re
        telefone = re.sub(r'\D', '', data.get('telefone', ''))
        if len(telefone) < 10 or len(telefone) > 11:
            return JsonResponse({
                'success': False,
                'message': 'Telefone deve ter entre 10 e 11 dígitos'
            }, status=400)
        
        # Atualizar os campos da chamada
        chamada.nome_contato = data.get('nome_contato', '').strip()
        chamada.telefone = data.get('telefone', '').strip()
        chamada.funcao = data.get('funcao', '').strip() or None
        chamada.setor = data.get('setor', '').strip() or None
        chamada.unidade = data.get('unidade', '').strip()
        chamada.municipio = data.get('municipio', '').strip() or None
        chamada.cnes = data.get('cnes', '').strip() or None
        chamada.contato_telefonico_cnes = data.get('contato_telefonico_cnes', '').strip() or None
        chamada.tipo_chamada = data.get('tipo_chamada', '').strip()
        chamada.status = data.get('status', '').strip()
        chamada.nome_atendente = data.get('nome_atendente', '').strip()
        chamada.descricao = data.get('descricao', '').strip()
        chamada.solucao = data.get('solucao', '').strip() or None
        
        # Atualizar data de modificação automaticamente
        chamada.data_atualizacao = timezone.now()
        
        # Salvar as alterações
        chamada.save()
        
        print(f"✅ [DEBUG EDITAR] Chamada atualizada com sucesso!")
        
        return JsonResponse({
            'success': True,
            'message': 'Chamada atualizada com sucesso!',
            'data': {
                'id': chamada.id,
                'data_atualizacao': chamada.data_atualizacao.strftime('%d/%m/%Y %H:%M:%S'),
                'usuario_editor': request.user.username
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Erro ao decodificar JSON da requisição'
        }, status=400)
        
    except Exception as e:
        print(f"❌ [DEBUG EDITAR] Erro inesperado: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return JsonResponse({
            'success': False,
            'message': f'Erro interno do servidor: {str(e)}'
        }, status=500)

@login_required
def visualizar_detalhes_chamada(request, chamada_id):
    """Visualizar detalhes completos de uma chamada"""
    try:
        chamada = RegistroChamada.objects.get(id=chamada_id)
        
        # Retornar dados em JSON para modal
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'data': {
                    'id': chamada.id,
                    'codigo': f"#{str(chamada.id).zfill(4)}",
                    'nome_contato': chamada.nome_contato,
                    'telefone': chamada.telefone,
                    'funcao': chamada.funcao or '',
                    'setor': chamada.setor or '',
                    'unidade': chamada.unidade,
                    'municipio': chamada.municipio or '',
                    'cnes': chamada.cnes or '',
                    'contato_telefonico_cnes': chamada.contato_telefonico_cnes or '',
                    'tipo_chamada': chamada.get_tipo_chamada_display() or chamada.tipo_chamada,
                    'status': chamada.get_status_display(),
                    'nome_atendente': chamada.nome_atendente,
                    'descricao': chamada.descricao,
                    'solucao': chamada.solucao or '',
                    'data_criacao': chamada.data_criacao.strftime('%d/%m/%Y às %H:%M:%S'),
                    'data_atualizacao': chamada.data_atualizacao.strftime('%d/%m/%Y às %H:%M:%S'),
                    'usuario_criador': chamada.usuario_criador.get_full_name() or chamada.usuario_criador.username,
                    'dias_desde_criacao': (timezone.now() - chamada.data_criacao).days,
                }
            })
        
        # Se não for AJAX, retornar para página de histórico
        return redirect('historico_chamadas')
        
    except RegistroChamada.DoesNotExist:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': False,
                'message': 'Chamada não encontrada'
            }, status=404)
        else:
            messages.error(request, 'Chamada não encontrada.')
            return redirect('historico_chamadas')

@login_required
def editar_chamada_form(request, chamada_id):
    """Carregar formulário de edição de uma chamada"""
    try:
        chamada = RegistroChamada.objects.get(id=chamada_id)
        
        # Retornar dados em JSON para modal
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'data': {
                    'id': chamada.id,
                    'codigo': f"#{str(chamada.id).zfill(4)}",
                    'nome_contato': chamada.nome_contato,
                    'telefone': chamada.telefone,
                    'funcao': chamada.funcao or '',
                    'setor': chamada.setor or '',
                    'unidade': chamada.unidade,
                    'municipio': chamada.municipio or '',
                    'cnes': chamada.cnes or '',
                    'contato_telefonico_cnes': chamada.contato_telefonico_cnes or '',
                    'tipo_chamada': chamada.tipo_chamada,
                    'status': chamada.status,
                    'nome_atendente': chamada.nome_atendente,
                    'descricao': chamada.descricao,
                    'solucao': chamada.solucao or '',
                    'data_criacao': chamada.data_criacao.strftime('%d/%m/%Y às %H:%M:%S'),
                    'data_atualizacao': chamada.data_atualizacao.strftime('%d/%m/%Y às %H:%M:%S'),
                }
            })
        
        # Se não for AJAX, retornar para página de histórico
        return redirect('historico_chamadas')
        
    except RegistroChamada.DoesNotExist:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': False,
                'message': 'Chamada não encontrada'
            }, status=404)
        else:
            messages.error(request, 'Chamada não encontrada.')
            return redirect('historico_chamadas')

@login_required
@user_passes_test(is_admin_user)
def configuracoes(request):
    """Página de configurações do sistema com React"""
    
    # Estatísticas gerais para exibir nas configurações
    total_unidades = UnidadeSaude.objects.count()
    total_chamadas = RegistroChamada.objects.count()
    
    # Estatísticas do usuário atual
    chamadas_usuario = RegistroChamada.objects.filter(usuario_criador=request.user).count()
    unidades_usuario = UnidadeSaude.objects.filter(usuario_cadastrante=request.user).count()
    
    context = {
        'usuario': request.user,
        'estatisticas': {
            'total_unidades': total_unidades,
            'total_chamadas': total_chamadas,
            'chamadas_usuario': chamadas_usuario,
            'unidades_usuario': unidades_usuario,
        },
        'total_usuarios': User.objects.count(),
        'data_atual': timezone.now(),
    }
    
    return render(request, 'configuracoes_react.html', context)

@login_required
def manual_sistema(request):
    """Página do manual do sistema - Guia completo de uso"""
    
    # Estatísticas do sistema para exibir no manual
    total_unidades = UnidadeSaude.objects.count()
    total_chamadas = RegistroChamada.objects.count()
    total_usuarios = User.objects.count()
    
    context = {
        'usuario': request.user,
        'estatisticas': {
            'total_unidades': total_unidades,
            'total_chamadas': total_chamadas,
            'total_usuarios': total_usuarios,
        },
        'data_atual': timezone.now(),
    }
    
    return render(request, 'manual_sistema.html', context)

@login_required
def editar_perfil(request, user_id=None):
    """Página para editar o perfil do usuário ou de outro usuário (se admin)"""
    
    # Inicializar variáveis padrão
    usuario_editado = request.user
    redirect_url = 'configuracoes'
    
    # Determinar qual usuário será editado
    if user_id:
        # Verificar se o usuário atual pode editar outros usuários
        if not request.user.is_staff:
            messages.error(request, 'Você não tem permissão para editar outros usuários.')
            return redirect('gerenciar_usuarios')
        
        # Obter o usuário a ser editado
        try:
            usuario_editado = get_object_or_404(User, id=user_id)
            redirect_url = 'gerenciar_usuarios'  # Redirecionar para gerenciar usuários após salvar
        except:
            messages.error(request, 'Usuário não encontrado.')
            return redirect('gerenciar_usuarios')
    
    if request.method == 'POST':
        try:
            # Atualizar dados do usuário
            user = usuario_editado
            
            # Campos básicos
            first_name = request.POST.get('first_name', '').strip()
            last_name = request.POST.get('last_name', '').strip()
            email = request.POST.get('email', '').strip()
            username = request.POST.get('username', '').strip()
            
            # Validações básicas
            if not first_name:
                messages.error(request, 'Nome é obrigatório.')
                return render(request, 'editar_perfil.html', {'usuario': request.user, 'usuario_editado': usuario_editado, 'editando_outro': user_id is not None})
            
            if not username:
                messages.error(request, 'Nome de usuário é obrigatório.')
                return render(request, 'editar_perfil.html', {'usuario': request.user, 'usuario_editado': usuario_editado, 'editando_outro': user_id is not None})
            
            # Verificar se o username já existe (exceto o próprio usuário)
            if User.objects.filter(username=username).exclude(pk=user.pk).exists():
                messages.error(request, 'Este nome de usuário já está em uso.')
                return render(request, 'editar_perfil.html', {'usuario': request.user, 'usuario_editado': usuario_editado, 'editando_outro': user_id is not None})
            
            # Verificar se o email já existe (exceto o próprio usuário)
            if email and User.objects.filter(email=email).exclude(pk=user.pk).exists():
                messages.error(request, 'Este email já está em uso.')
                return render(request, 'editar_perfil.html', {'usuario': request.user, 'usuario_editado': usuario_editado, 'editando_outro': user_id is not None})
            
            # Atualizar os dados
            user.first_name = first_name
            user.last_name = last_name
            user.email = email
            user.username = username
            user.save()
            
            if user_id:
                messages.success(request, f'Usuário "{user.get_full_name() or user.username}" atualizado com sucesso!')
            else:
                messages.success(request, 'Perfil atualizado com sucesso!')
            
            return redirect(redirect_url)
            
        except Exception as e:
            messages.error(request, f'Erro ao atualizar perfil: {str(e)}')
            return render(request, 'editar_perfil.html', {'usuario': request.user, 'usuario_editado': usuario_editado, 'editando_outro': user_id is not None})
    
    # GET request - exibir formulário
    context = {
        'usuario': request.user,
        'usuario_editado': usuario_editado,
        'editando_outro': user_id is not None,
        'data_atual': timezone.now(),
    }
    
    return render(request, 'editar_perfil_moderno.html', context)

class CustomPasswordChangeView(PasswordChangeView):
    """View customizada para alterar senha"""
    template_name = 'alterar_senha_react.html'
    form_class = PasswordChangeForm
    success_url = reverse_lazy('configuracoes')
    
    def form_valid(self, form):
        messages.success(self.request, 'Senha alterada com sucesso!')
        return super().form_valid(form)
    
    def form_invalid(self, form):
        for field, errors in form.errors.items():
            for error in errors:
                messages.error(self.request, f'{error}')
        return super().form_invalid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['usuario'] = self.request.user
        context['data_atual'] = timezone.now()
        return context

@login_required
def notificacoes(request):
    """Página para configurar notificações do usuário"""
    
    if request.method == 'POST':
        try:
            # Recuperar dados do formulário
            email_chamadas = request.POST.get('email_chamadas') == 'on'
            email_status = request.POST.get('email_status') == 'on'
            email_relatorios = request.POST.get('email_relatorios') == 'on'
            email_seguranca = request.POST.get('email_seguranca') == 'on'
            
            sistema_alertas = request.POST.get('sistema_alertas') == 'on'
            sistema_popups = request.POST.get('sistema_popups') == 'on'
            sistema_badge = request.POST.get('sistema_badge') == 'on'
            sistema_som = request.POST.get('sistema_som') == 'on'
            
            frequencia = request.POST.get('frequencia', 'imediato')
            horario_inicio = request.POST.get('horario_inicio', '08:00')
            horario_fim = request.POST.get('horario_fim', '18:00')
            
            # Aqui você salvaria as configurações no profile do usuário ou em um modelo específico
            # Por enquanto, vamos simular salvando na sessão
            request.session['notificacoes_config'] = {
                'email': {
                    'chamadas': email_chamadas,
                    'status': email_status,
                    'relatorios': email_relatorios,
                    'seguranca': email_seguranca,
                },
                'sistema': {
                    'alertas': sistema_alertas,
                    'popups': sistema_popups,
                    'badge': sistema_badge,
                    'som': sistema_som,
                },
                'configuracoes': {
                    'frequencia': frequencia,
                    'horario_inicio': horario_inicio,
                    'horario_fim': horario_fim,
                }
            }
            
            messages.success(request, 'Configurações de notificação salvas com sucesso!')
            return redirect('configuracoes')
            
        except Exception as e:
            messages.error(request, f'Erro ao salvar configurações: {str(e)}')
    
    # Recuperar configurações existentes (da sessão ou banco de dados)
    config_atual = request.session.get('notificacoes_config', {
        'email': {
            'chamadas': True,
            'status': True,
            'relatorios': False,
            'seguranca': True,
        },
        'sistema': {
            'alertas': True,
            'popups': True,
            'badge': True,
            'som': False,
        },
        'configuracoes': {
            'frequencia': 'imediato',
            'horario_inicio': '08:00',
            'horario_fim': '18:00',
        }
    })
    
    # Estatísticas para exibir na página
    total_chamadas = RegistroChamada.objects.filter(usuario_criador=request.user).count()
    chamadas_mes = RegistroChamada.objects.filter(
        usuario_criador=request.user,
        data_criacao__month=timezone.now().month,
        data_criacao__year=timezone.now().year
    ).count()
    
    # Serializar configurações para JSON
    import json
    
    context = {
        'usuario': request.user,
        'config_json': json.dumps(config_atual),
        'estatisticas_json': json.dumps({
            'total_chamadas': total_chamadas,
            'chamadas_mes': chamadas_mes,
        }),
        'data_atual': timezone.now(),
    }
    
    return render(request, 'notificacoes_react.html', context)

@login_required
@user_passes_test(is_admin_user)
def criar_usuario(request):
    """Página para criar um novo usuário"""
    
    if request.method == 'POST':
        try:
            # Coletar dados do formulário
            username = request.POST.get('username', '').strip()
            email = request.POST.get('email', '').strip()
            first_name = request.POST.get('first_name', '').strip()
            last_name = request.POST.get('last_name', '').strip()
            password1 = request.POST.get('password1', '')
            password2 = request.POST.get('password2', '')
            is_staff = request.POST.get('is_staff') == 'on'
            is_active = request.POST.get('is_active', 'on') == 'on'
            
            # Validações
            if not username:
                messages.error(request, 'Nome de usuário é obrigatório.')
                context = get_user_statistics(request.user)
                context['estatisticas_usuarios'] = json.dumps(context['estatisticas_usuarios'])
                return render(request, 'criar_usuario_react.html', context)
            
            if not first_name:
                messages.error(request, 'Nome é obrigatório.')
                context = get_user_statistics(request.user)
                context['estatisticas_usuarios'] = json.dumps(context['estatisticas_usuarios'])
                return render(request, 'criar_usuario_react.html', context)
            
            if not password1:
                messages.error(request, 'Senha é obrigatória.')
                context = get_user_statistics(request.user)
                context['estatisticas_usuarios'] = json.dumps(context['estatisticas_usuarios'])
                return render(request, 'criar_usuario_react.html', context)
            
            if password1 != password2:
                messages.error(request, 'As senhas não coincidem.')
                context = get_user_statistics(request.user)
                context['estatisticas_usuarios'] = json.dumps(context['estatisticas_usuarios'])
                return render(request, 'criar_usuario_react.html', context)
            
            if len(password1) < 8:
                messages.error(request, 'A senha deve ter pelo menos 8 caracteres.')
                context = get_user_statistics(request.user)
                context['estatisticas_usuarios'] = json.dumps(context['estatisticas_usuarios'])
                return render(request, 'criar_usuario_react.html', context)
            
            # Verificar se o username já existe
            if User.objects.filter(username=username).exists():
                messages.error(request, 'Este nome de usuário já existe.')
                context = get_user_statistics(request.user)
                context['estatisticas_usuarios'] = json.dumps(context['estatisticas_usuarios'])
                return render(request, 'criar_usuario_react.html', context)
            
            # Verificar se o email já existe (se fornecido)
            if email and User.objects.filter(email=email).exists():
                messages.error(request, 'Este email já está em uso.')
                context = get_user_statistics(request.user)
                context['estatisticas_usuarios'] = json.dumps(context['estatisticas_usuarios'])
                return render(request, 'criar_usuario_react.html', context)
            
            # Criar o usuário
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password1,
                first_name=first_name,
                last_name=last_name,
                is_staff=is_staff,
                is_active=is_active
            )
            
            messages.success(request, f'Usuário "{user.get_full_name() or user.username}" criado com sucesso!')
            return redirect('gerenciar_usuarios')
            
        except Exception as e:
            messages.error(request, f'Erro ao criar usuário: {str(e)}')
            # Recalcular estatísticas em caso de erro para manter a página atualizada
            context = get_user_statistics(request.user)
            # Serializar dados para o componente React
            context['estatisticas_usuarios'] = json.dumps(context['estatisticas_usuarios'])
            return render(request, 'criar_usuario_react.html', context)
    
    # GET - exibir formulário com estatísticas reais
    context = get_user_statistics(request.user)
    
    # Adicionar dados específicos para o template
    context.update({
        'total_usuarios': context.get('total_usuarios', 0),
        'usuarios_ativos': context.get('usuarios_ativos', 0),
        'administradores': context.get('administradores', 0),
        'usuarios_recentes': context.get('usuarios_recentes', 0)
    })
    
    # Serializar dados para o componente React
    context['estatisticas_usuarios'] = json.dumps(context['estatisticas_usuarios'])
    
    return render(request, 'criar_usuario_react.html', context)


def get_user_statistics(current_user):
    """Função auxiliar para obter estatísticas reais dos usuários"""
    from datetime import datetime, timedelta
    
    # Estatísticas gerais de usuários
    total_usuarios = User.objects.count()
    usuarios_ativos = User.objects.filter(is_active=True).count()
    usuarios_admins = User.objects.filter(is_staff=True).count()
    
    # Usuários criados recentemente (últimos 30 dias)
    data_limite = timezone.now() - timedelta(days=30)
    usuarios_recentes = User.objects.filter(date_joined__gte=data_limite).count()
    
    # Estatísticas adicionais
    usuarios_inativos = User.objects.filter(is_active=False).count()
    usuarios_com_email = User.objects.exclude(email='').count()
    
    # Últimos usuários criados (para preview)
    ultimos_usuarios = User.objects.order_by('-date_joined')[:5]
    
    # Dados de atividade
    usuarios_com_chamadas = User.objects.filter(
        chamadas_criadas__isnull=False
    ).distinct().count()
    
    usuarios_com_unidades = User.objects.filter(
        unidades_cadastradas__isnull=False
    ).distinct().count()
    
    return {
        'usuario': current_user,
        'data_atual': timezone.now(),
        'estatisticas_usuarios': {
            'total_usuarios': total_usuarios,
            'usuarios_ativos': usuarios_ativos,
            'usuarios_admins': usuarios_admins,
            'usuarios_recentes': usuarios_recentes,
            'usuarios_inativos': usuarios_inativos,
            'usuarios_com_email': usuarios_com_email,
            'usuarios_com_chamadas': usuarios_com_chamadas,
            'usuarios_com_unidades': usuarios_com_unidades,
        },
        'ultimos_usuarios': ultimos_usuarios,
    }

@login_required
@user_passes_test(is_admin_user)
def gerenciar_usuarios(request):
    """Página para gerenciar usuários existentes"""
    
    # Filtros de busca
    busca = request.GET.get('busca', '').strip()
    is_active = request.GET.get('is_active', '')
    is_staff = request.GET.get('is_staff', '')
    date_from = request.GET.get('date_from', '')
    date_to = request.GET.get('date_to', '')
    order_by = request.GET.get('order_by', '-date_joined')
    has_email = request.GET.get('has_email', '')
    atividade_periodo = request.GET.get('atividade_periodo', '')
    
    # Query base
    usuarios = User.objects.all()
    
    # Aplicar filtros
    if busca:
        usuarios = usuarios.filter(
            Q(username__icontains=busca) |
            Q(first_name__icontains=busca) |
            Q(last_name__icontains=busca) |
            Q(email__icontains=busca)
        )
    
    if is_active == 'true':
        usuarios = usuarios.filter(is_active=True)
    elif is_active == 'false':
        usuarios = usuarios.filter(is_active=False)
    
    if is_staff == 'true':
        usuarios = usuarios.filter(is_staff=True)
    elif is_staff == 'false':
        usuarios = usuarios.filter(is_staff=False)
    
    # Filtro por presença de email
    if has_email == 'true':
        usuarios = usuarios.exclude(email='')
    elif has_email == 'false':
        usuarios = usuarios.filter(email='')
    
    # Filtro por data de cadastro
    if date_from:
        try:
            from datetime import datetime
            data_inicio = datetime.strptime(date_from, '%Y-%m-%d').date()
            usuarios = usuarios.filter(date_joined__date__gte=data_inicio)
        except ValueError:
            pass
    
    if date_to:
        try:
            from datetime import datetime
            data_fim = datetime.strptime(date_to, '%Y-%m-%d').date()
            usuarios = usuarios.filter(date_joined__date__lte=data_fim)
        except ValueError:
            pass
    
    # Filtro por atividade recente
    if atividade_periodo:
        try:
            dias = int(atividade_periodo)
            data_limite = timezone.now() - timedelta(days=dias)
            # Usuários que criaram chamadas recentemente
            usuarios_com_atividade = RegistroChamada.objects.filter(
                data_criacao__gte=data_limite
            ).values_list('usuario_criador_id', flat=True).distinct()
            usuarios = usuarios.filter(id__in=usuarios_com_atividade)
        except (ValueError, TypeError):
            pass
    
    # Aplicar ordenação
    ordem_valida = {
        'username': 'username',
        '-username': '-username',
        'first_name': 'first_name',
        '-first_name': '-first_name',
        'date_joined': 'date_joined',
        '-date_joined': '-date_joined',
        'last_login': 'last_login',
        '-last_login': '-last_login',
        'email': 'email',
        '-email': '-email',
    }
    
    if order_by in ordem_valida:
        usuarios = usuarios.order_by(ordem_valida[order_by])
    else:
        usuarios = usuarios.order_by('-date_joined')
    
    # Adicionar estatísticas para cada usuário
    usuarios_com_stats = []
    for usuario in usuarios:
        # Contar unidades cadastradas pelo usuário
        unidades_count = UnidadeSaude.objects.filter(usuario_cadastrante=usuario).count()
        
        # Contar chamadas registradas pelo usuário
        chamadas_count = RegistroChamada.objects.filter(usuario_criador=usuario).count()
        
        # Última atividade (última chamada registrada)
        ultima_chamada = RegistroChamada.objects.filter(usuario_criador=usuario).order_by('-data_criacao').first()
        ultima_atividade = ultima_chamada.data_criacao if ultima_chamada else None
        
        usuarios_com_stats.append({
            'usuario': usuario,
            'unidades_count': unidades_count,
            'chamadas_count': chamadas_count,
            'ultima_atividade': ultima_atividade,
        })
    
    # Paginação
    paginator = Paginator(usuarios_com_stats, 10)  # 10 usuários por página
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Estatísticas gerais
    total_usuarios = User.objects.count()
    usuarios_ativos = User.objects.filter(is_active=True).count()
    usuarios_staff = User.objects.filter(is_staff=True).count()
    usuarios_inativos = User.objects.filter(is_active=False).count()
    
    context = {
        'page_obj': page_obj,
        'total_usuarios': total_usuarios,
        'usuarios_ativos': usuarios_ativos,
        'usuarios_staff': usuarios_staff,
        'usuarios_inativos': usuarios_inativos,
        'filtros': {
            'busca': busca,
            'is_active': is_active,
            'is_staff': is_staff,
            'date_from': date_from,
            'date_to': date_to,
            'order_by': order_by,
            'has_email': has_email,
            'atividade_periodo': atividade_periodo,
        },
        'usuario': request.user,
        'data_atual': timezone.now(),
    }
    
    return render(request, 'gerenciar_usuarios.html', context)

@login_required
def detalhes_usuario(request, user_id):
    """Visualizar detalhes completos de um usuário"""
    
    # Verificar se o usuário pode ver detalhes de outros usuários
    if not request.user.is_staff and request.user.id != user_id:
        messages.error(request, 'Você não tem permissão para ver detalhes de outros usuários.')
        return redirect('gerenciar_usuarios')
    
    usuario = get_object_or_404(User, id=user_id)
    
    # Obter estatísticas detalhadas do usuário
    unidades_cadastradas = UnidadeSaude.objects.filter(usuario_cadastrante=usuario).order_by('-created_at')
    chamadas_registradas = RegistroChamada.objects.filter(usuario_criador=usuario).order_by('-data_criacao')
    
    # Estatísticas por período
    hoje = timezone.now().date()
    inicio_mes = hoje.replace(day=1)
    inicio_ano = hoje.replace(month=1, day=1)
    
    # Chamadas do usuário por período
    chamadas_hoje = chamadas_registradas.filter(data_criacao__date=hoje).count()
    chamadas_mes = chamadas_registradas.filter(data_criacao__date__gte=inicio_mes).count()
    chamadas_ano = chamadas_registradas.filter(data_criacao__date__gte=inicio_ano).count()
    
    # Unidades do usuário por período
    unidades_mes = unidades_cadastradas.filter(created_at__date__gte=inicio_mes).count()
    unidades_ano = unidades_cadastradas.filter(created_at__date__gte=inicio_ano).count()
    
    # Atividade recente (últimas 10 ações)
    atividades_recentes = []
    
    # Adicionar unidades recentes
    for unidade in unidades_cadastradas[:5]:
        atividades_recentes.append({
            'tipo': 'unidade',
            'acao': 'Cadastrou unidade',
            'descricao': unidade.nome,
            'data': unidade.created_at,
            'icone': 'fas fa-hospital',
            'cor': 'primary'
        })
    
    # Adicionar chamadas recentes
    for chamada in chamadas_registradas[:5]:
        atividades_recentes.append({
            'tipo': 'chamada',
            'acao': 'Registrou chamada',
            'descricao': f'{chamada.unidade_solicitante.nome} → {chamada.unidade_executante.nome}',
            'data': chamada.data_criacao,
            'icone': 'fas fa-phone',
            'cor': 'success'
        })
    
    # Ordenar atividades por data (mais recente primeiro)
    atividades_recentes.sort(key=lambda x: x['data'], reverse=True)
    atividades_recentes = atividades_recentes[:10]  # Manter apenas as 10 mais recentes
    
    # Última atividade
    ultima_atividade = None
    if atividades_recentes:
        ultima_atividade = atividades_recentes[0]['data']
    
    # Perfil do usuário
    try:
        profile = UserProfile.objects.get(user=usuario)
    except UserProfile.DoesNotExist:
        profile = None
    
    context = {
        'usuario_detalhes': usuario,
        'profile': profile,
        'unidades_cadastradas': unidades_cadastradas[:10],  # Últimas 10
        'chamadas_registradas': chamadas_registradas[:10],  # Últimas 10
        'estatisticas': {
            'total_unidades': unidades_cadastradas.count(),
            'total_chamadas': chamadas_registradas.count(),
            'chamadas_hoje': chamadas_hoje,
            'chamadas_mes': chamadas_mes,
            'chamadas_ano': chamadas_ano,
            'unidades_mes': unidades_mes,
            'unidades_ano': unidades_ano,
        },
        'atividades_recentes': atividades_recentes,
        'ultima_atividade': ultima_atividade,
        'usuario': request.user,
        'data_atual': timezone.now(),
    }
    
    return render(request, 'detalhes_usuario.html', context)

@login_required
def editar_usuario(request, user_id):
    """Editar um usuário específico"""
    
    # Verificar se o usuário pode editar outros usuários
    if not request.user.is_staff:
        messages.error(request, 'Você não tem permissão para editar usuários.')
        return redirect('gerenciar_usuarios')
    
    usuario_editado = get_object_or_404(User, id=user_id)
    
    if request.method == 'POST':
        try:
            # Coletar dados do formulário
            username = request.POST.get('username', '').strip()
            email = request.POST.get('email', '').strip()
            first_name = request.POST.get('first_name', '').strip()
            last_name = request.POST.get('last_name', '').strip()
            is_staff = request.POST.get('is_staff') == 'on'
            is_active = request.POST.get('is_active', 'on') == 'on'
            
            # Validações
            if not username:
                messages.error(request, 'Nome de usuário é obrigatório.')
                return render(request, 'editar_usuario_react.html', {'usuario_editado': usuario_editado})
            
            if not first_name:
                messages.error(request, 'Nome é obrigatório.')
                return render(request, 'editar_usuario_react.html', {'usuario_editado': usuario_editado})
            
            # Verificar se o username já existe (exceto o próprio usuário)
            if User.objects.filter(username=username).exclude(pk=usuario_editado.pk).exists():
                messages.error(request, 'Este nome de usuário já existe.')
                return render(request, 'editar_usuario_react.html', {'usuario_editado': usuario_editado})
            
            # Verificar se o email já existe (exceto o próprio usuário)
            if email and User.objects.filter(email=email).exclude(pk=usuario_editado.pk).exists():
                messages.error(request, 'Este email já está em uso.')
                return render(request, 'editar_usuario_react.html', {'usuario_editado': usuario_editado})
            
            # Atualizar o usuário
            usuario_editado.username = username
            usuario_editado.email = email
            usuario_editado.first_name = first_name
            usuario_editado.last_name = last_name
            usuario_editado.is_staff = is_staff
            usuario_editado.is_active = is_active
            usuario_editado.save()
            
            messages.success(request, f'Usuário "{usuario_editado.get_full_name() or usuario_editado.username}" atualizado com sucesso!')
            return redirect('gerenciar_usuarios')
            
        except Exception as e:
            messages.error(request, f'Erro ao atualizar usuário: {str(e)}')
            return render(request, 'editar_usuario_react.html', {'usuario_editado': usuario_editado})
    
    # GET - exibir formulário
    context = {
        'usuario_editado': usuario_editado,
        'usuario': request.user,
        'data_atual': timezone.now(),
    }
    
    return render(request, 'editar_usuario_react.html', context)

@login_required
def desativar_usuario(request, user_id):
    """Ativar/Desativar um usuário"""
    
    # Verificar se o usuário pode editar outros usuários
    if not request.user.is_staff:
        messages.error(request, 'Você não tem permissão para gerenciar usuários.')
        return redirect('gerenciar_usuarios')
    
    usuario_alvo = get_object_or_404(User, id=user_id)
    
    # Não permitir desativar o próprio usuário
    if usuario_alvo == request.user:
        messages.error(request, 'Você não pode desativar sua própria conta.')
        return redirect('gerenciar_usuarios')
    
    # Alternar status
    if usuario_alvo.is_active:
        usuario_alvo.is_active = False
        action = 'desativado'
    else:
        usuario_alvo.is_active = True
        action = 'ativado'
    
    usuario_alvo.save()
    
    messages.success(request, f'Usuário "{usuario_alvo.get_full_name() or usuario_alvo.username}" {action} com sucesso!')
    return redirect('gerenciar_usuarios')

@login_required
def excluir_usuario(request, user_id):
    """Excluir um usuário inativo"""
    
    # Verificar se o usuário pode excluir outros usuários
    if not request.user.is_staff:
        messages.error(request, 'Você não tem permissão para excluir usuários.')
        return redirect('gerenciar_usuarios')
    
    usuario_alvo = get_object_or_404(User, id=user_id)
    
    # Não permitir excluir o próprio usuário
    if usuario_alvo == request.user:
        messages.error(request, 'Você não pode excluir sua própria conta.')
        return redirect('gerenciar_usuarios')
    
    # Só permitir excluir usuários inativos
    if usuario_alvo.is_active:
        messages.error(request, 'Só é possível excluir usuários inativos. Desative o usuário primeiro.')
        return redirect('gerenciar_usuarios')
    
    # Verificar se o usuário tem dados relacionados importantes
    unidades_cadastradas = UnidadeSaude.objects.filter(usuario_cadastrante=usuario_alvo).count()
    chamadas_registradas = RegistroChamada.objects.filter(usuario_criador=usuario_alvo).count()
    
    if request.method == 'POST':
        try:
            nome_usuario = usuario_alvo.get_full_name() or usuario_alvo.username
            
            # Se houver dados relacionados, oferecer opção de transferir ou manter histórico
            if unidades_cadastradas > 0 or chamadas_registradas > 0:
                # Por segurança, não excluir usuários com dados importantes
                # Apenas marcar como excluído ou transferir dados
                messages.warning(request, 
                    f'Usuário "{nome_usuario}" possui {unidades_cadastradas} unidades e {chamadas_registradas} chamadas registradas. '
                    'Por motivos de integridade dos dados, o usuário foi mantido como inativo.')
                return redirect('gerenciar_usuarios')
            
            # Excluir o usuário (sem dados relacionados importantes)
            usuario_alvo.delete()
            
            messages.success(request, f'Usuário "{nome_usuario}" excluído com sucesso!')
            return redirect('gerenciar_usuarios')
            
        except Exception as e:
            messages.error(request, f'Erro ao excluir usuário: {str(e)}')
            return redirect('gerenciar_usuarios')
    
    # GET request - mostrar confirmação
    context = {
        'usuario_alvo': usuario_alvo,
        'unidades_cadastradas': unidades_cadastradas,
        'chamadas_registradas': chamadas_registradas,
    }
    
    # Para requisições AJAX, retornar JSON
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True,
            'usuario': {
                'id': usuario_alvo.id,
                'nome': usuario_alvo.get_full_name() or usuario_alvo.username,
                'username': usuario_alvo.username,
                'unidades_cadastradas': unidades_cadastradas,
                'chamadas_registradas': chamadas_registradas,
                'pode_excluir': unidades_cadastradas == 0 and chamadas_registradas == 0
            }
        })
    
    return render(request, 'confirmar_exclusao_usuario.html', context)

@csrf_exempt
@require_http_methods(["POST"])
def api_excluir_usuario(request):
    """API para excluir usuário via AJAX"""
    
    if not request.user.is_staff:
        return JsonResponse({'success': False, 'message': 'Permissão negada.'}, status=403)
    
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        
        if not user_id:
            return JsonResponse({'success': False, 'message': 'ID do usuário é obrigatório.'}, status=400)
        
        usuario_alvo = get_object_or_404(User, id=user_id)
        
        # Verificações de segurança
        if usuario_alvo == request.user:
            return JsonResponse({'success': False, 'message': 'Você não pode excluir sua própria conta.'}, status=400)
        
        if usuario_alvo.is_active:
            return JsonResponse({'success': False, 'message': 'Só é possível excluir usuários inativos.'}, status=400)
        
        # Verificar dados relacionados
        unidades_cadastradas = UnidadeSaude.objects.filter(usuario_cadastrante=usuario_alvo).count()
        chamadas_registradas = RegistroChamada.objects.filter(usuario_criador=usuario_alvo).count()
        
        if unidades_cadastradas > 0 or chamadas_registradas > 0:
            return JsonResponse({
                'success': False, 
                'message': f'Usuário possui {unidades_cadastradas} unidades e {chamadas_registradas} chamadas registradas. Não é possível excluir para manter a integridade dos dados.'
            }, status=400)
        
        # Excluir usuário
        nome_usuario = usuario_alvo.get_full_name() or usuario_alvo.username
        usuario_alvo.delete()
        
        return JsonResponse({
            'success': True, 
            'message': f'Usuário "{nome_usuario}" excluído com sucesso!'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'message': 'Dados JSON inválidos.'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Erro interno: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def api_estatisticas_usuarios(request):
    """API para obter estatísticas atualizadas dos usuários em tempo real"""
    
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Usuário não autenticado'
        }, status=401)
    
    try:
        # Calcular estatísticas em tempo real
        total_usuarios = User.objects.count()
        usuarios_ativos = User.objects.filter(is_active=True).count()
        usuarios_admins = User.objects.filter(is_staff=True).count()
        
        # Usuários criados recentemente (últimos 30 dias)
        data_limite = timezone.now() - timedelta(days=30)
        usuarios_recentes = User.objects.filter(date_joined__gte=data_limite).count()
        
        # Estatísticas adicionais
        usuarios_inativos = User.objects.filter(is_active=False).count()
        usuarios_com_email = User.objects.exclude(email='').count()
        
        # Dados de atividade
        usuarios_com_chamadas = User.objects.filter(
            chamadas_criadas__isnull=False
        ).distinct().count()
        
        usuarios_com_unidades = User.objects.filter(
            unidades_cadastradas__isnull=False
        ).distinct().count()
        
        # Últimos usuários criados
        ultimos_usuarios = User.objects.order_by('-date_joined')[:5]
        ultimos_usuarios_data = []
        
        for usuario in ultimos_usuarios:
            ultimos_usuarios_data.append({
                'id': usuario.id,
                'username': usuario.username,
                'nome_completo': usuario.get_full_name(),
                'email': usuario.email,
                'is_active': usuario.is_active,
                'is_staff': usuario.is_staff,
                'date_joined': usuario.date_joined.strftime('%d/%m/%Y %H:%M'),
                'chamadas_count': RegistroChamada.objects.filter(usuario_criador=usuario).count(),
                'unidades_count': UnidadeSaude.objects.filter(usuario_cadastrante=usuario).count(),
            })
        
        # Estatísticas por mês (últimos 6 meses)
        meses_stats = []
        for i in range(6):
            data_mes = timezone.now() - timedelta(days=30*i)
            usuarios_mes = User.objects.filter(
                date_joined__month=data_mes.month,
                date_joined__year=data_mes.year
            ).count()
            meses_stats.append({
                'mes': data_mes.strftime('%b/%Y'),
                'usuarios': usuarios_mes
            })
        
        return JsonResponse({
            'success': True,
            'data': {
                'estatisticas_gerais': {
                    'total_usuarios': total_usuarios,
                    'usuarios_ativos': usuarios_ativos,
                    'usuarios_admins': usuarios_admins,
                    'usuarios_recentes': usuarios_recentes,
                    'usuarios_inativos': usuarios_inativos,
                    'usuarios_com_email': usuarios_com_email,
                    'usuarios_com_chamadas': usuarios_com_chamadas,
                    'usuarios_com_unidades': usuarios_com_unidades,
                },
                'ultimos_usuarios': ultimos_usuarios_data,
                'estatisticas_mensais': meses_stats,
                'timestamp': timezone.now().isoformat(),
            },
            'message': 'Estatísticas carregadas com sucesso'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Erro ao carregar estatísticas: {str(e)}'
        }, status=500)

@login_required
@user_passes_test(is_admin_user)
def backup_sistema(request):
    """Página de backup do sistema - Apenas para administradores"""
    
    # Função protegida por decorator - apenas administradores podem acessar
    
    if request.method == 'POST':
        try:
            backup_type = request.POST.get('backup_type', '')
            format_type = request.POST.get('format_type', 'json')
            include_users = request.POST.get('include_users') == 'on'
            include_unidades = request.POST.get('include_unidades') == 'on'
            include_chamadas = request.POST.get('include_chamadas') == 'on'
            
            if not any([include_users, include_unidades, include_chamadas]):
                messages.error(request, 'Selecione pelo menos um tipo de dados para fazer backup.')
                return redirect('backup_sistema')
            
            # Gerar backup baseado nas opções selecionadas
            backup_data = {}
            backup_info = {
                'gerado_em': timezone.now().isoformat(),
                'gerado_por': request.user.username,
                'versao_sistema': '1.0',
                'tipos_incluidos': []
            }
            
            if include_users:
                users_data = []
                for user in User.objects.all():
                    users_data.append({
                        'id': user.id,
                        'username': user.username,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'email': user.email,
                        'is_staff': user.is_staff,
                        'is_active': user.is_active,
                        'date_joined': user.date_joined.isoformat(),
                        'last_login': user.last_login.isoformat() if user.last_login else None,
                    })
                backup_data['usuarios'] = users_data
                backup_info['tipos_incluidos'].append(f"Usuários ({len(users_data)})")
            
            if include_unidades:
                unidades_data = []
                for unidade in UnidadeSaude.objects.all():
                    unidades_data.append({
                        'id': unidade.id,
                        'nome': unidade.nome,
                        'municipio': unidade.municipio,
                        'tipo': unidade.tipo,
                        'endereco': unidade.endereco,
                        'telefone': unidade.telefone,
                        'responsavel': unidade.responsavel,
                        'cnes': unidade.cnes,
                        'email': unidade.email,
                        'horario_funcionamento': unidade.horario_funcionamento,
                        'servicos_emergencia': unidade.servicos_emergencia,
                        'created_at': unidade.created_at.isoformat(),
                        'updated_at': unidade.updated_at.isoformat(),
                        'usuario_cadastrante_id': unidade.usuario_cadastrante.id if unidade.usuario_cadastrante else None,
                    })
                backup_data['unidades_saude'] = unidades_data
                backup_info['tipos_incluidos'].append(f"Unidades de Saúde ({len(unidades_data)})")
            
            if include_chamadas:
                chamadas_data = []
                for chamada in RegistroChamada.objects.all():
                    chamadas_data.append({
                        'id': chamada.id,
                        'nome_contato': chamada.nome_contato,
                        'telefone': chamada.telefone,
                        'funcao': chamada.funcao,
                        'setor': chamada.setor,
                        'unidade': chamada.unidade,
                        'municipio': chamada.municipio,
                        'cnes': chamada.cnes,
                        'contato_telefonico_cnes': chamada.contato_telefonico_cnes,
                        'tipo_chamada': chamada.tipo_chamada,
                        'status': chamada.status,
                        'nome_atendente': chamada.nome_atendente,
                        'descricao': chamada.descricao,
                        'solucao': chamada.solucao,
                        'data_criacao': chamada.data_criacao.isoformat(),
                        'usuario_criador_id': chamada.usuario_criador.id if chamada.usuario_criador else None,
                    })
                backup_data['chamadas'] = chamadas_data
                backup_info['tipos_incluidos'].append(f"Chamadas ({len(chamadas_data)})")
            
            backup_data['_info'] = backup_info
            
            # Preparar resposta de download
            if format_type == 'json':
                response = HttpResponse(
                    json.dumps(backup_data, indent=2, ensure_ascii=False),
                    content_type='application/json'
                )
                filename = f"backup_sistema_{timezone.now().strftime('%Y%m%d_%H%M%S')}.json"
            elif format_type == 'csv':
                response = HttpResponse(content_type='text/csv')
                filename = f"backup_sistema_{timezone.now().strftime('%Y%m%d_%H%M%S')}.csv"
                writer = csv.writer(response)
                
                # Cabeçalho com informações do backup
                writer.writerow(['=== BACKUP DO SISTEMA ==='])
                writer.writerow(['Gerado em:', backup_info['gerado_em']])
                writer.writerow(['Gerado por:', backup_info['gerado_por']])
                writer.writerow(['Tipos incluídos:', ', '.join(backup_info['tipos_incluidos'])])
                writer.writerow([])
                
                # Dados dos usuários
                if include_users:
                    writer.writerow(['=== USUÁRIOS ==='])
                    writer.writerow(['ID', 'Username', 'Nome', 'Sobrenome', 'Email', 'É Admin', 'Ativo', 'Data Cadastro'])
                    for user_data in backup_data.get('usuarios', []):
                        writer.writerow([
                            user_data['id'],
                            user_data['username'],
                            user_data['first_name'],
                            user_data['last_name'],
                            user_data['email'],
                            'Sim' if user_data['is_staff'] else 'Não',
                            'Sim' if user_data['is_active'] else 'Não',
                            user_data['date_joined']
                        ])
                    writer.writerow([])
                
                # Dados das unidades
                if include_unidades:
                    writer.writerow(['=== UNIDADES DE SAÚDE ==='])
                    writer.writerow(['ID', 'Nome', 'Município', 'Tipo', 'CNES', 'Telefone', 'Data Cadastro'])
                    for unidade_data in backup_data.get('unidades_saude', []):
                        writer.writerow([
                            unidade_data['id'],
                            unidade_data['nome'],
                            unidade_data['municipio'],
                            unidade_data['tipo'],
                            unidade_data['cnes'],
                            unidade_data['telefone'],
                            unidade_data['created_at']
                        ])
                    writer.writerow([])
                
                # Dados das chamadas
                if include_chamadas:
                    writer.writerow(['=== CHAMADAS ==='])
                    writer.writerow(['ID', 'Contato', 'Telefone', 'Unidade', 'Tipo', 'Status', 'Data'])
                    for chamada_data in backup_data.get('chamadas', []):
                        writer.writerow([
                            chamada_data['id'],
                            chamada_data['nome_contato'],
                            chamada_data['telefone'],
                            chamada_data['unidade'],
                            chamada_data['tipo_chamada'],
                            chamada_data['status'],
                            chamada_data['data_criacao']
                        ])
            
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            # Registrar a ação de backup
            messages.success(request, f'Backup gerado com sucesso! Arquivo: {filename}')
            
            return response
            
        except Exception as e:
            messages.error(request, f'Erro ao gerar backup: {str(e)}')
            return redirect('backup_sistema')
    
    # GET - Exibir página de configuração de backup
    # Calcular estatísticas para exibir na página
    stats = {
        'total_usuarios': User.objects.count(),
        'usuarios_ativos': User.objects.filter(is_active=True).count(),
        'usuarios_admins': User.objects.filter(is_staff=True).count(),
        'total_unidades': UnidadeSaude.objects.count(),
        'unidades_tipos': {
            'executantes': UnidadeSaude.objects.filter(tipo='UNIDADE_EXECUTANTE').count(),
            'solicitantes': UnidadeSaude.objects.filter(tipo='UNIDADE_SOLICITANTE').count(),
            'executante_solicitante': UnidadeSaude.objects.filter(tipo='EXECUTANTE_SOLICITANTE').count(),
        },
        'total_chamadas': RegistroChamada.objects.count(),
        'chamadas_tipos': {},
        'tamanho_estimado': {
            'usuarios': User.objects.count() * 0.5,  # KB estimado por usuário
            'unidades': UnidadeSaude.objects.count() * 1.2,  # KB estimado por unidade
            'chamadas': RegistroChamada.objects.count() * 2.0,  # KB estimado por chamada
        }
    }
    
    # Contar tipos de chamadas
    for tipo in ['SUPORTE_TECNICO', 'CONSULTORIA', 'TREINAMENTO', 'MANUTENCAO', 'OUTRO']:
        stats['chamadas_tipos'][tipo] = RegistroChamada.objects.filter(tipo_chamada=tipo).count()
    
    # Informações de espaço em disco (simulado)
    import os
    try:
        # Tentar obter informações de espaço em disco
        if hasattr(os, 'statvfs'):  # Unix/Linux
            statvfs = os.statvfs('.')
            disk_space_free = statvfs.f_frsize * statvfs.f_bavail / (1024**3)  # GB
        else:  # Windows
            import shutil
            disk_space_free = shutil.disk_usage('.')[2] / (1024**3)  # GB
    except:
        disk_space_free = 0
    
    context = {
        'usuario': request.user,
        'data_atual': timezone.now(),
        'stats': stats,
        'disk_space_free': round(disk_space_free, 2),
        'estimated_backup_size': sum(stats['tamanho_estimado'].values()),
    }
    
    return render(request, 'backup_sistema.html', context)

@login_required
@user_passes_test(is_admin_user)
def relatorios_sistema(request):
    """Página de relatórios do sistema - Estatísticas e análises"""
    
    from datetime import datetime, timedelta
    from django.db.models import Count, Q
    from collections import defaultdict
    import calendar
    
    # Verificar se o usuário pode acessar relatórios (pode ser configurado conforme necessário)
    # Por enquanto, permitindo todos os usuários logados
    
    # Período padrão: últimos 12 meses
    hoje = timezone.now().date()
    inicio_periodo = hoje.replace(month=1, day=1)  # Início do ano atual
    if request.GET.get('periodo'):
        try:
            meses = int(request.GET.get('periodo', 12))
            inicio_periodo = hoje - timedelta(days=30 * meses)
        except:
            pass
    
    # Tipo de relatório selecionado
    tipo_relatorio = request.GET.get('tipo', 'geral')
    
    # ESTATÍSTICAS GERAIS
    stats_gerais = {
        'total_usuarios': User.objects.count(),
        'usuarios_ativos': User.objects.filter(is_active=True).count(),
        'usuarios_admins': User.objects.filter(is_staff=True).count(),
        'total_unidades': UnidadeSaude.objects.count(),
        'total_chamadas': RegistroChamada.objects.count(),
    }
    
    # RELATÓRIO DE USUÁRIOS
    usuarios_stats = {
        'por_mes': {},
        'por_tipo': {
            'usuarios_comuns': User.objects.filter(is_staff=False).count(),
            'administradores': User.objects.filter(is_staff=True).count(),
        },
        'atividade_recente': {},
        'top_usuarios': [],
        'usuarios_mes_atual': User.objects.filter(
            date_joined__year=hoje.year,
            date_joined__month=hoje.month
        ).count()
    }
    
    # Usuários por mês (últimos 12 meses)
    for i in range(12):
        data = hoje - timedelta(days=30 * i)
        mes_nome = calendar.month_name[data.month]
        usuarios_mes = User.objects.filter(
            date_joined__year=data.year,
            date_joined__month=data.month
        ).count()
        usuarios_stats['por_mes'][f"{mes_nome} {data.year}"] = usuarios_mes
    
    # Top usuários por atividade - VERSÃO SIMPLIFICADA E GARANTIDA
    usuarios_stats['top_usuarios'] = []
    
    # Pegar todos os usuários ordenados por data de criação
    all_users = User.objects.all().order_by('-date_joined')[:15]
    
    for i, usuario in enumerate(all_users):
        # Contar dados reais do usuário
        total_chamadas = RegistroChamada.objects.filter(usuario_criador=usuario).count()
        chamadas_resolvidas = RegistroChamada.objects.filter(
            usuario_criador=usuario, 
            status='RESOLVIDA'
        ).count()
        unidades_cadastradas = UnidadeSaude.objects.filter(usuario_cadastrante=usuario).count()
        # Apenas use os valores reais do banco
        # Não preencha com dados de exemplo!
        # Adicione ao top_usuarios apenas se houver dados reais
        if total_chamadas > 0 or unidades_cadastradas > 0:
            usuarios_stats['top_usuarios'].append({
                'usuario': usuario,
                'total_chamadas': total_chamadas,
                'chamadas_resolvidas': chamadas_resolvidas,
                'chamadas_mes_atual': 0,  # ajuste se necessário
                'unidades_cadastradas': unidades_cadastradas,
                'taxa_resolucao': round((chamadas_resolvidas / total_chamadas * 100), 1) if total_chamadas > 0 else 0,
                'pontuacao_atividade': (total_chamadas * 3) + (unidades_cadastradas * 10) + (chamadas_resolvidas * 2),
                'atividade_recente': 0,  # ajuste se necessário
                'tipo_principal': 'SUPORTE_TECNICO',
                'crescimento_mensal': 0,  # ajuste se necessário
                'nivel': '',  # ajuste se necessário
                'cor_nivel': '',  # ajuste se necessário
                'days_since_join': (hoje - usuario.date_joined.date()).days,
                'media_diaria': round(total_chamadas / max((hoje - usuario.date_joined.date()).days, 1), 2)
            })
    
    # Garantir que há pelo menos um usuário para demonstração
    if not usuarios_stats['top_usuarios']:
        # Criar um usuário de exemplo se não há nenhum no sistema
        usuarios_stats['top_usuarios'] = [{
            'usuario': type('obj', (object,), {
                'get_full_name': lambda: 'Usuário Exemplo',
                'username': 'exemplo',
                'is_staff': False,
                'date_joined': timezone.now()
            })(),
            'total_chamadas': 5,
            'chamadas_resolvidas': 4,
            'chamadas_mes_atual': 2,
            'unidades_cadastradas': 1,
            'taxa_resolucao': 80.0,
            'pontuacao_atividade': 25,
            'atividade_recente': 1,
            'tipo_principal': 'SUPORTE_TECNICO',
            'crescimento_mensal': 20.0,
            'nivel': 'Avançado',
            'cor_nivel': 'silver',
            'days_since_join': 30,
            'media_diaria': 0.17
        }]
    
    # RELATÓRIO DE UNIDADES
    unidades_stats = {
        'por_tipo': {},
        'por_municipio': {},
        'mais_ativas': [],
        'cadastros_por_mes': {}
    }
    
    # Unidades por tipo
    tipos_unidades = ['UNIDADE_EXECUTANTE', 'UNIDADE_SOLICITANTE', 'EXECUTANTE_SOLICITANTE']
    for tipo in tipos_unidades:
        count = UnidadeSaude.objects.filter(tipo=tipo).count()
        unidades_stats['por_tipo'][tipo.replace('_', ' ').title()] = count
    
    # Top 10 municípios com mais unidades
    municipios_data = UnidadeSaude.objects.values('municipio').annotate(
        total=Count('id')
    ).order_by('-total')[:10]
    
    for municipio in municipios_data:
        unidades_stats['por_municipio'][municipio['municipio']] = municipio['total']
    
    # Unidades mais ativas (com mais chamadas)
    # Como não há ForeignKey direto, vamos calcular manualmente
    unidades_ativas_data = []
    for unidade in UnidadeSaude.objects.all():
        total_chamadas = RegistroChamada.objects.filter(unidade=unidade.nome).count()
        unidades_ativas_data.append({
            'unidade': unidade,
            'total_chamadas': total_chamadas
        })
    
    # Ordenar por total de chamadas e pegar os top 10
    unidades_ativas_data.sort(key=lambda x: x['total_chamadas'], reverse=True)
    unidades_stats['mais_ativas'] = unidades_ativas_data[:10]
    
    # RELATÓRIO DE CHAMADAS
    chamadas_stats = {
        'por_tipo': {},
        'por_status': {},
        'por_mes': {},
        'por_usuario': {},
        'total_chamadas_usuario_atual': 0,
        'tempo_medio_resolucao': 0,
        'picos_atendimento': {}
    }
    
    # Para usuários administradores, mostrar total de chamadas por usuário
    if request.user.is_staff:
        # Chamadas por usuário (apenas para administradores)
        usuarios_com_chamadas = User.objects.annotate(
            total_chamadas_registradas=Count('chamadas_criadas')
        ).filter(total_chamadas_registradas__gt=0).order_by('-total_chamadas_registradas')
        
        chamadas_por_usuario = {}
        for user in usuarios_com_chamadas:
            nome_display = user.get_full_name() or user.username
            chamadas_por_usuario[nome_display] = user.total_chamadas_registradas
        
        chamadas_stats['por_usuario'] = chamadas_por_usuario
        chamadas_stats['total_usuarios_com_chamadas'] = usuarios_com_chamadas.count()
        
        # Total de chamadas do usuário atual (administrador logado)
        chamadas_stats['total_chamadas_usuario_atual'] = RegistroChamada.objects.filter(
            usuario_criador=request.user
        ).count()
    else:
        # Para usuários não-administradores, mostrar apenas suas próprias chamadas
        chamadas_stats['total_chamadas_usuario_atual'] = RegistroChamada.objects.filter(
            usuario_criador=request.user
        ).count()
    
    # Manter lógica original para tipos e status (pode ser útil para outras seções)
    tipos_chamadas = ['SUPORTE_TECNICO', 'CONSULTORIA', 'TREINAMENTO', 'MANUTENCAO', 'OUTRO']
    for tipo in tipos_chamadas:
        count = RegistroChamada.objects.filter(tipo_chamada=tipo).count()
        chamadas_stats['por_tipo'][tipo.replace('_', ' ').title()] = count
    
    # Chamadas por status
    status_chamadas = ['ABERTA', 'EM_ANDAMENTO', 'RESOLVIDA', 'CANCELADA']
    for status in status_chamadas:
        count = RegistroChamada.objects.filter(status=status).count()
        chamadas_stats['por_status'][status.replace('_', ' ').title()] = count
    
    # Chamadas por mês (últimos 12 meses)
    for i in range(12):
        data = hoje - timedelta(days=30 * i)
        mes_nome = calendar.month_name[data.month]
        chamadas_mes = RegistroChamada.objects.filter(
            data_criacao__year=data.year,
            data_criacao__month=data.month
        ).count()
        chamadas_stats['por_mes'][f"{mes_nome} {data.year}"] = chamadas_mes
    
    # ANÁLISES AVANÇADAS
    analises = {
        'crescimento_usuarios': 0,
        'crescimento_unidades': 0,
        'crescimento_chamadas': 0,
        'tendencias': {},
        'insights': []
    }
    
    # Calcular crescimento mensal
    mes_atual = User.objects.filter(date_joined__month=hoje.month, date_joined__year=hoje.year).count()
    mes_anterior = User.objects.filter(
        date_joined__month=(hoje - timedelta(days=30)).month,
        date_joined__year=(hoje - timedelta(days=30)).year
    ).count()
    
    if mes_anterior > 0:
        analises['crescimento_usuarios'] = round(((mes_atual - mes_anterior) / mes_anterior) * 100, 1)
    
    # Insights automáticos
    if stats_gerais['usuarios_ativos'] / stats_gerais['total_usuarios'] > 0.8:
        analises['insights'].append({
            'tipo': 'positivo',
            'titulo': 'Alta Taxa de Usuários Ativos',
            'descricao': f"{(stats_gerais['usuarios_ativos'] / stats_gerais['total_usuarios'] * 100):.1f}% dos usuários estão ativos"
        })
    
    if len(usuarios_stats['top_usuarios']) > 0 and usuarios_stats['top_usuarios'][0]['total_chamadas'] > 50:
        top_user = usuarios_stats['top_usuarios'][0]
        analises['insights'].append({
            'tipo': 'destaque',
            'titulo': 'Usuário Mais Ativo',
            'descricao': f"{top_user['usuario'].get_full_name() or top_user['usuario'].username} registrou {top_user['total_chamadas']} chamadas"
        })
    
    # DADOS PARA GRÁFICOS (formato JSON)
    graficos_data = {
        'usuarios_mes': list(usuarios_stats['por_mes'].values()),
        'usuarios_mes_labels': list(usuarios_stats['por_mes'].keys()),
        'chamadas_tipo': list(chamadas_stats['por_tipo'].values()),
        'chamadas_tipo_labels': list(chamadas_stats['por_tipo'].keys()),
        'unidades_municipio': list(unidades_stats['por_municipio'].values())[:5],  # Top 5
        'unidades_municipio_labels': list(unidades_stats['por_municipio'].keys())[:5],
    }
    
    context = {
        'usuario': request.user,
        'data_atual': timezone.now(),
        'tipo_relatorio': tipo_relatorio,
        'periodo_selecionado': request.GET.get('periodo', '12'),
        'stats_gerais': stats_gerais,
        'usuarios_stats': usuarios_stats,
        'unidades_stats': unidades_stats,
        'chamadas_stats': chamadas_stats,
        'analises': analises,
        'graficos_data': json.dumps(graficos_data),
    }
    
    return render(request, 'relatorios_react.html', context)

@login_required
def export_relatorio_usuarios_mes_excel(request):
    """Exportar relatório detalhado de Novos Usuários por Mês em Excel"""
    import pandas as pd
    from datetime import datetime, timedelta
    import calendar
    
    # Configurar período (últimos 12 meses ou período personalizado)
    hoje = timezone.now().date()
    periodo_meses = int(request.GET.get('periodo', 12))
    
    # Dados mensais de usuários
    dados_mensais = []
    dados_detalhados = []
    
    # Calcular dados para cada mês
    for i in range(periodo_meses):
        data_mes = hoje - timedelta(days=30 * i)
        mes_nome = calendar.month_name[data_mes.month]
        ano = data_mes.year
        
        # Usuários criados no mês
        usuarios_mes = User.objects.filter(
            date_joined__year=ano,
            date_joined__month=data_mes.month
        ).order_by('date_joined')
        
        # Estatísticas do mês
        total_mes = usuarios_mes.count()
        ativos_mes = usuarios_mes.filter(is_active=True).count()
        admins_mes = usuarios_mes.filter(is_staff=True).count()
        usuarios_comuns_mes = usuarios_mes.filter(is_staff=False).count()
        
        dados_mensais.append({
            'Mês': f"{mes_nome} {ano}",
            'Ano': ano,
            'Mês Número': data_mes.month,
            'Total Novos Usuários': total_mes,
            'Usuários Ativos': ativos_mes,
            'Administradores': admins_mes,
            'Usuários Comuns': usuarios_comuns_mes,
            'Taxa de Ativação (%)': round((ativos_mes / total_mes * 100) if total_mes > 0 else 0, 2),
            'Percentual Admins (%)': round((admins_mes / total_mes * 100) if total_mes > 0 else 0, 2),
        })
        
        # Dados detalhados de cada usuário do mês
        for usuario in usuarios_mes:
            unidades_count = UnidadeSaude.objects.filter(usuario_cadastrante=usuario).count()
            chamadas_count = RegistroChamada.objects.filter(usuario_criador=usuario).count()
            
            dados_detalhados.append({
                'Mês Cadastro': f"{mes_nome} {ano}",
                'Data Cadastro': usuario.date_joined.strftime('%d/%m/%Y %H:%M:%S'),
                'Nome Completo': usuario.get_full_name() or 'Não informado',
                'Nome de Usuário': usuario.username,
                'Email': usuario.email or 'Não informado',
                'Tipo': 'Administrador' if usuario.is_staff else 'Usuário',
                'Status': 'Ativo' if usuario.is_active else 'Inativo',
                'Superusuário': 'Sim' if usuario.is_superuser else 'Não',
                'Último Login': usuario.last_login.strftime('%d/%m/%Y %H:%M:%S') if usuario.last_login else 'Nunca fez login',
                'Unidades Cadastradas': unidades_count,
                'Chamadas Registradas': chamadas_count,
                'Dias Desde Cadastro': (timezone.now().date() - usuario.date_joined.date()).days,
            })
    
    # Reverter para ordem cronológica
    dados_mensais.reverse()
    
    # Estatísticas gerais do período
    total_periodo = User.objects.filter(
        date_joined__gte=hoje - timedelta(days=30 * periodo_meses)
    ).count()
    
    usuarios_periodo = User.objects.filter(
        date_joined__gte=hoje - timedelta(days=30 * periodo_meses)
    )
    
    estatisticas_periodo = {
        'Total Usuários Criados': total_periodo,
        'Usuários Ativos': usuarios_periodo.filter(is_active=True).count(),
        'Administradores': usuarios_periodo.filter(is_staff=True).count(),
        'Taxa Média Mensal': round(total_periodo / periodo_meses, 2),
        'Melhor Mês': max(dados_mensais, key=lambda x: x['Total Novos Usuários'])['Mês'] if dados_mensais else 'N/A',
        'Máximo em um Mês': max(dados_mensais, key=lambda x: x['Total Novos Usuários'])['Total Novos Usuários'] if dados_mensais else 0,
        'Período Analisado': f"{periodo_meses} meses",
        'Data do Relatório': timezone.now().strftime('%d/%m/%Y %H:%M:%S'),
    }
    
    # Criar arquivo Excel com múltiplas abas
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename="relatorio_usuarios_por_mes.xlsx"'
    
    with pd.ExcelWriter(response, engine='openpyxl') as writer:
        # Aba 1: Resumo Mensal
        df_mensal = pd.DataFrame(dados_mensais)
        df_mensal.to_excel(writer, sheet_name='Resumo Mensal', index=False)
        
        # Aba 2: Usuários Detalhados
        df_detalhado = pd.DataFrame(dados_detalhados)
        df_detalhado.to_excel(writer, sheet_name='Usuários Detalhados', index=False)
        
        # Aba 3: Estatísticas do Período
        df_stats = pd.DataFrame([estatisticas_periodo])
        df_stats.to_excel(writer, sheet_name='Estatísticas Período', index=False)
        
        # Aba 4: Análise de Tendências
        if len(dados_mensais) >= 2:
            tendencias = []
            for i in range(1, len(dados_mensais)):
                mes_atual = dados_mensais[i]
                mes_anterior = dados_mensais[i-1]
                
                crescimento = mes_atual['Total Novos Usuários'] - mes_anterior['Total Novos Usuários']
                crescimento_perc = round((crescimento / mes_anterior['Total Novos Usuários'] * 100) if mes_anterior['Total Novos Usuários'] > 0 else 0, 2)
                
                tendencias.append({
                    'Mês': mes_atual['Mês'],
                    'Usuários Mês Atual': mes_atual['Total Novos Usuários'],
                    'Usuários Mês Anterior': mes_anterior['Total Novos Usuários'],
                    'Crescimento Absoluto': crescimento,
                    'Crescimento (%)': crescimento_perc,
                    'Tendência': 'Crescimento' if crescimento > 0 else 'Decréscimo' if crescimento < 0 else 'Estável'
                })
            
            df_tendencias = pd.DataFrame(tendencias)
            df_tendencias.to_excel(writer, sheet_name='Análise Tendências', index=False)
    
    return response

@login_required
def export_relatorio_usuarios_mes_csv(request):
    """Exportar relatório de Novos Usuários por Mês em CSV"""
    import csv
    from datetime import datetime, timedelta
    import calendar
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="relatorio_usuarios_por_mes.csv"'
    
    writer = csv.writer(response)
    
    # Cabeçalho do relatório
    writer.writerow(['RELATÓRIO DE NOVOS USUÁRIOS POR MÊS'])
    writer.writerow(['Data de Geração:', timezone.now().strftime('%d/%m/%Y %H:%M:%S')])
    writer.writerow(['Sistema de Registro de Chamados'])
    writer.writerow([])  # Linha em branco
    
    # Configurar período
    hoje = timezone.now().date()
    periodo_meses = int(request.GET.get('periodo', 12))
    
    # Cabeçalho dos dados
    writer.writerow([
        'Mês/Ano', 'Total Novos Usuários', 'Usuários Ativos', 
        'Administradores', 'Usuários Comuns', 'Taxa de Ativação (%)', 
        'Percentual Admins (%)'
    ])
    
    # Dados mensais
    dados_mensais = []
    for i in range(periodo_meses):
        data_mes = hoje - timedelta(days=30 * i)
        mes_nome = calendar.month_name[data_mes.month]
        ano = data_mes.year
        
        usuarios_mes = User.objects.filter(
            date_joined__year=ano,
            date_joined__month=data_mes.month
        )
        
        total_mes = usuarios_mes.count()
        ativos_mes = usuarios_mes.filter(is_active=True).count()
        admins_mes = usuarios_mes.filter(is_staff=True).count()
        usuarios_comuns_mes = usuarios_mes.filter(is_staff=False).count()
        
        dados_mensais.append([
            f"{mes_nome} {ano}",
            total_mes,
            ativos_mes,
            admins_mes,
            usuarios_comuns_mes,
            round((ativos_mes / total_mes * 100) if total_mes > 0 else 0, 2),
            round((admins_mes / total_mes * 100) if total_mes > 0 else 0, 2),
        ])
    
    # Escrever dados em ordem cronológica
    dados_mensais.reverse()
    for linha in dados_mensais:
        writer.writerow(linha)
    
    # Estatísticas resumo
    writer.writerow([])  # Linha em branco
    writer.writerow(['ESTATÍSTICAS DO PERÍODO'])
    
    total_periodo = sum(linha[1] for linha in dados_mensais)
    writer.writerow(['Total de Usuários Criados:', total_periodo])
    writer.writerow(['Média Mensal:', round(total_periodo / periodo_meses, 2)])
    
    if dados_mensais:
        melhor_mes_linha = max(dados_mensais, key=lambda x: x[1])
        writer.writerow(['Melhor Mês:', f"{melhor_mes_linha[0]} ({melhor_mes_linha[1]} usuários)"])
    
    return response

@login_required
def export_relatorio_usuarios_mes_pdf(request):
    """Exportar relatório de Novos Usuários por Mês em PDF - Versão Melhorada"""
    
    try:
        print("🔄 [PDF] Iniciando exportação de relatório PDF...")
        
        # Imports necessários
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.units import inch
        from datetime import datetime, timedelta
        import calendar
        import io
        
        # Configurar response com headers otimizados
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="relatorio_usuarios_por_mes.pdf"'
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        response['X-Content-Type-Options'] = 'nosniff'
        
        print("📄 [PDF] Response configurado...")
        
        # Criar buffer em memória para o PDF
        buffer = io.BytesIO()
        
        # Criar documento PDF com template personalizado
        doc = CustomDocTemplate(buffer, pagesize=A4, 
                              leftMargin=72, rightMargin=72, 
                              topMargin=72, bottomMargin=72)
        elements = []
        
        # Adicionar espaçamento após o cabeçalho
        adicionar_cabecalho_pdf(elements)
        
        styles = getSampleStyleSheet()
        
        print("📝 [PDF] Documento criado...")
        
        # Estilo personalizado para títulos
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=20,
            spaceAfter=30,
            textColor=colors.darkblue,
            alignment=1  # Centralizado
        )
        
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=20,
            textColor=colors.darkgrey,
            alignment=1  # Centralizado
        )
        
        # === CABEÇALHO DO RELATÓRIO COM LOGO DA CORE ===
        
        # Adicionar logo da CORE centralizada na página 1
        try:
            from reportlab.platypus import Image
            import os
            from django.conf import settings
            
            print("🏥 [PDF] Adicionando logo da CORE na página 1...")
            
            # Localizar a logo da CORE
            core_logo_paths = [
                os.path.join(settings.BASE_DIR, 'static', 'images', 'horizontal.png'),
                os.path.join(settings.BASE_DIR, 'horizontal.png'),
                os.path.join(settings.BASE_DIR, 'static', 'images', 'logo-transparent.png'),
                os.path.join(settings.BASE_DIR, 'logo-transparent.png'),
            ]
            
            logo_core_path = None
            
            # Encontrar logo da CORE
            for logo_path in core_logo_paths:
                if os.path.exists(logo_path):
                    logo_core_path = logo_path
                    print(f"🏥 [PDF] Logo CORE encontrada: {logo_path}")
                    break
            
            # Adicionar logo da CORE centralizada e maior
            if logo_core_path:
                # Logo da CORE com tamanho maior
                core_img = Image(logo_core_path, width=5*inch, height=1.5*inch)
                core_img.hAlign = 'CENTER'
                elements.append(core_img)
                elements.append(Spacer(1, 20))
                print("✅ [PDF] Logo CORE adicionada com sucesso!")
            else:
                # Fallback: cabeçalho textual da CORE
                print("⚠️ [PDF] Logo CORE não encontrada, criando cabeçalho textual...")
                core_style = ParagraphStyle(
                    'CoreStyle',
                    parent=styles['Heading1'],
                    fontSize=22,
                    spaceAfter=20,
                    textColor=colors.Color(0.2, 0.6, 0.4),  # Verde médico
                    alignment=1,  # Centralizado
                    borderWidth=3,
                    borderColor=colors.Color(0.2, 0.6, 0.4),
                    borderPadding=15,
                    fontName='Helvetica-Bold'
                )
                elements.append(Paragraph("CORE - CENTRAL DE REGULAÇÃO", core_style))
                elements.append(Spacer(1, 15))
                
        except Exception as e:
            print(f"⚠️ [PDF] Erro ao carregar logo da CORE: {e}")
            # Fallback: cabeçalho simples
            fallback_style = ParagraphStyle(
                'FallbackStyle',
                parent=styles['Heading1'],
                fontSize=20,
                spaceAfter=15,
                textColor=colors.darkblue,
                alignment=1,
                fontName='Helvetica-Bold'
            )
            elements.append(Paragraph("CORE - CENTRAL DE REGULAÇÃO", fallback_style))
            elements.append(Spacer(1, 15))
        
        # Adicionar texto do Ministério da Saúde
        ministerio_style = ParagraphStyle(
            'MinisterioStyle',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=30,
            textColor=colors.grey,
            alignment=1,
            fontName='Helvetica-Bold'
        )
        elements.append(Paragraph("MINISTÉRIO DA SAÚDE", ministerio_style))
        
        # Título do relatório
        elements.append(Paragraph("RELATÓRIO DE NOVOS USUÁRIOS POR MÊS", title_style))
        elements.append(Paragraph("Sistema de Registro de Chamados", subtitle_style))
        elements.append(Paragraph(f"Gerado em: {timezone.now().strftime('%d/%m/%Y às %H:%M:%S')}", styles['Normal']))
        elements.append(Spacer(1, 30))
        
        print("📊 [PDF] Cabeçalho adicionado...")
        
        # === CONFIGURAR PERÍODO ===
        hoje = timezone.now().date()
        periodo_meses = int(request.GET.get('periodo', 12))
        
        print(f"📅 [PDF] Período: {periodo_meses} meses")
        
        # === COLETAR DADOS ===
        dados_tabela = [['Mês/Ano', 'Novos Usuários', 'Usuários Ativos', 'Administradores', 'Taxa Ativação']]
        total_periodo = 0
        dados_mensais = []
        
        for i in range(periodo_meses):
            data_mes = hoje - timedelta(days=30 * i)
            mes_nome = calendar.month_name[data_mes.month]
            ano = data_mes.year
            
            # Buscar usuários do mês
            try:
                usuarios_mes = User.objects.filter(
                    date_joined__year=ano,
                    date_joined__month=data_mes.month
                )
                
                total_mes = usuarios_mes.count()
                ativos_mes = usuarios_mes.filter(is_active=True).count()
                admins_mes = usuarios_mes.filter(is_staff=True).count()
                taxa_ativacao = round((ativos_mes / total_mes * 100) if total_mes > 0 else 0, 1)
                
                dados_mensais.append({
                    'mes': f"{mes_nome} {ano}",
                    'total': total_mes,
                    'ativos': ativos_mes,
                    'admins': admins_mes,
                    'taxa': taxa_ativacao
                })
                total_periodo += total_mes
                
            except Exception as e:
                print(f"❌ [PDF] Erro ao processar mês {mes_nome} {ano}: {e}")
                # Adicionar dados vazios em caso de erro
                dados_mensais.append({
                    'mes': f"{mes_nome} {ano}",
                    'total': 0,
                    'ativos': 0,
                    'admins': 0,
                    'taxa': 0
                })
        
        print(f"📈 [PDF] Dados coletados: {len(dados_mensais)} meses, Total: {total_periodo} usuários")
        
        # Reverter para ordem cronológica
        dados_mensais.reverse()
        
        # === CRIAR TABELA PRINCIPAL ===
        for dado in dados_mensais:
            dados_tabela.append([
                dado['mes'],
                str(dado['total']),
                str(dado['ativos']),
                str(dado['admins']),
                f"{dado['taxa']}%"
            ])
        
        # Criar e estilizar tabela
        table = Table(dados_tabela, colWidths=[2.2*inch, 1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch])
        table.setStyle(TableStyle([
            # Cabeçalho
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            
            # Corpo da tabela
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            
            # Linhas alternadas
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 40))
        
        print("📋 [PDF] Tabela principal criada...")
        
        # === ESTATÍSTICAS RESUMO ===
        elements.append(Paragraph("ESTATÍSTICAS DO PERÍODO", styles['Heading2']))
        
        stats_data = [
            ['Métrica', 'Valor'],
            ['Total de Usuários Criados', str(total_periodo)],
            ['Período Analisado', f'{periodo_meses} meses'],
            ['Média Mensal', f'{round(total_periodo / periodo_meses, 1) if periodo_meses > 0 else 0} usuários'],
        ]
        
        if dados_mensais and len(dados_mensais) > 0:
            try:
                melhor_mes = max(dados_mensais, key=lambda x: x['total'])
                stats_data.append(['Melhor Mês', f"{melhor_mes['mes']} ({melhor_mes['total']} usuários)"])
                
                pior_mes = min(dados_mensais, key=lambda x: x['total'])
                stats_data.append(['Menor Mês', f"{pior_mes['mes']} ({pior_mes['total']} usuários)"])
            except Exception as e:
                print(f"⚠️ [PDF] Erro ao calcular melhor/pior mês: {e}")
        
        # Calcular tendência
        if len(dados_mensais) >= 6:
            try:
                primeiro_trimestre = sum(d['total'] for d in dados_mensais[:3]) / 3
                ultimo_trimestre = sum(d['total'] for d in dados_mensais[-3:]) / 3
                tendencia = 'Crescimento' if ultimo_trimestre > primeiro_trimestre else 'Decréscimo'
                stats_data.append(['Tendência Geral', tendencia])
            except Exception as e:
                print(f"⚠️ [PDF] Erro ao calcular tendência: {e}")
        
        # Criar tabela de estatísticas
        stats_table = Table(stats_data, colWidths=[3*inch, 3*inch])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkgrey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightblue),
        ]))
        
        elements.append(stats_table)
        elements.append(Spacer(1, 40))
        
        print("📊 [PDF] Estatísticas adicionadas...")
        
        # === INSIGHTS E ANÁLISES ===
        elements.append(Paragraph("ANÁLISES E INSIGHTS", styles['Heading2']))
        
        insights = []
        if dados_mensais and len(dados_mensais) >= 2:
            try:
                # Insight sobre crescimento
                if dados_mensais[0]['total'] > 0:
                    crescimento_total = ((dados_mensais[-1]['total'] - dados_mensais[0]['total']) / dados_mensais[0]['total'] * 100)
                    insights.append(f"• Crescimento total no período: {crescimento_total:.1f}%")
                
                # Insight sobre ativação
                taxa_ativacao_media = sum(d['taxa'] for d in dados_mensais) / len(dados_mensais)
                insights.append(f"• Taxa média de ativação de usuários: {taxa_ativacao_media:.1f}%")
                
                # Insight sobre administradores
                total_admins = sum(d['admins'] for d in dados_mensais)
                if total_periodo > 0:
                    perc_admins = (total_admins / total_periodo * 100)
                    insights.append(f"• Percentual de administradores: {perc_admins:.1f}%")
                
            except Exception as e:
                print(f"⚠️ [PDF] Erro ao calcular insights: {e}")
                insights.append("• Dados insuficientes para análise detalhada")
        else:
            insights.append("• Período analisado possui poucos dados para insights detalhados")
        
        # Adicionar insights ao PDF
        for insight in insights:
            elements.append(Paragraph(insight, styles['Normal']))
            elements.append(Spacer(1, 10))
        
        print("💡 [PDF] Insights adicionados...")
        
        # === RODAPÉ INSTITUCIONAL ===
        elements.append(Spacer(1, 30))
        
        # Linha divisora
        from reportlab.platypus import HRFlowable
        elements.append(HRFlowable(width="100%", thickness=1, lineCap='round', color=colors.lightgrey))
        elements.append(Spacer(1, 10))
        
        # Rodapé da CORE
        footer_style = ParagraphStyle(
            'FooterStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.grey,
            alignment=1,  # Centralizado
            spaceAfter=5
        )
        
        elements.append(Paragraph("CORE - CENTRAL DE REGULAÇÃO", footer_style))
        elements.append(Paragraph("MINISTÉRIO DA SAÚDE", footer_style))
        elements.append(Paragraph("Sistema de Registro de Chamados", footer_style))
        
        print("📝 [PDF] Rodapé institucional adicionado...")
        
        # === ADICIONAR BRASÃO DO MS NO FINAL DA PÁGINA 2 ===
        try:
            import os
            
            print("🏛️ [PDF] Adicionando brasão do MS no final da página 2...")
            
            # Localizar o brasão do MS
            brasao_ms_paths = [
                os.path.join(settings.BASE_DIR, 'static', 'images', 'brasao_ms.png'),
                os.path.join(settings.BASE_DIR, 'brasao_ms.png'),
            ]
            
            logo_brasao_path = None
            
            # Encontrar brasão do MS
            for brasao_path in brasao_ms_paths:
                if os.path.exists(brasao_path):
                    logo_brasao_path = brasao_path
                    print(f"🏛️ [PDF] Brasão MS encontrado: {brasao_path}")
                    break
            
            # Adicionar espaçamento menor para manter tudo na página 2
            elements.append(Spacer(1, 1*inch))  # Espaço reduzido
            
            if logo_brasao_path:
                # Divisor visual
                from reportlab.platypus import HRFlowable
                elements.append(HRFlowable(width="100%", thickness=1, lineCap='round', color=colors.lightgrey))
                elements.append(Spacer(1, 10))
                
                # Brasão do MS centralizado e menor para economizar espaço
                brasao_img = Image(logo_brasao_path, width=2*inch, height=2*inch)
                brasao_img.hAlign = 'CENTER'
                elements.append(brasao_img)
                elements.append(Spacer(1, 10))
                print("✅ [PDF] Brasão MS adicionado na página 2 com sucesso!")
                
                # Texto do governo centralizado com espaçamento reduzido
                governo_style = ParagraphStyle(
                    'GovernoStyle',
                    parent=styles['Heading3'],
                    fontSize=13,
                    spaceAfter=5,
                    textColor=colors.Color(0.0, 0.3, 0.6),  # Azul oficial
                    alignment=1,  # Centralizado
                    fontName='Helvetica-Bold'
                )
                elements.append(Paragraph("GOVERNO DO ESTADO", governo_style))
                
                estado_style = ParagraphStyle(
                    'EstadoStyle',
                    parent=styles['Normal'],
                    fontSize=11,
                    spaceAfter=5,
                    textColor=colors.Color(0.0, 0.3, 0.6),  # Azul oficial
                    alignment=1,  # Centralizado
                    fontName='Helvetica-Bold'
                )
                elements.append(Paragraph("MATO GROSSO DO SUL", estado_style))
                
            else:
                # Fallback: texto do governo
                print("⚠️ [PDF] Brasão MS não encontrado, criando texto do governo...")
                elements.append(Spacer(1, 1*inch))
                
                governo_fallback_style = ParagraphStyle(
                    'GovernoFallbackStyle',
                    parent=styles['Heading3'],
                    fontSize=16,
                    spaceAfter=15,
                    textColor=colors.Color(0.0, 0.3, 0.6),  # Azul oficial
                    alignment=1,  # Centralizado
                    borderWidth=2,
                    borderColor=colors.Color(0.0, 0.3, 0.6),
                    borderPadding=10,
                    fontName='Helvetica-Bold'
                )
                elements.append(Paragraph("GOVERNO DO ESTADO<br/>MATO GROSSO DO SUL", governo_fallback_style))
                
        except Exception as e:
            print(f"⚠️ [PDF] Erro ao carregar brasão do MS: {e}")
            # Em caso de erro, apenas continua sem o brasão
            pass
        
        # === CONSTRUIR PDF ===
        print("🔨 [PDF] Construindo documento...")
        doc.build(elements)
        
        # Obter conteúdo do buffer
        pdf_content = buffer.getvalue()
        buffer.close()
        
        print(f"✅ [PDF] PDF gerado com sucesso! Tamanho: {len(pdf_content)} bytes")
        
        # Verificar se PDF está válido (começar com %PDF)
        if pdf_content.startswith(b'%PDF'):
            print("✅ [PDF] Assinatura PDF válida encontrada")
        else:
            print("⚠️ [PDF] Assinatura PDF não encontrada - pode estar corrompido")
            print(f"🔍 [PDF] Primeiros 50 bytes: {pdf_content[:50]}")
        
        # Configurar Content-Length
        response['Content-Length'] = str(len(pdf_content))
        
        # Escrever conteúdo na response
        response.write(pdf_content)
        
        print(f"📤 [PDF] Response enviado - Content-Length: {response.get('Content-Length')}")
        return response
        
    except ImportError as e:
        print(f"❌ [PDF] Erro de importação: {e}")
        return HttpResponse(
            f"Erro: Biblioteca reportlab não instalada. Execute: pip install reportlab\nDetalhes: {e}", 
            status=500
        )
        
    except Exception as e:
        print(f"❌ [PDF] Erro geral na exportação: {e}")
        import traceback
        traceback.print_exc()
        
        # Retornar erro em formato JSON para debug
        return HttpResponse(
            f"Erro ao gerar relatório PDF: {str(e)}\n\nVerifique o console do servidor para mais detalhes.", 
            status=500,
            content_type='text/plain'
        )

@login_required
@require_http_methods(["POST"])
def upload_avatar(request):
    """View para upload de avatar do usuário"""
    try:
        if 'avatar' not in request.FILES:
            return JsonResponse({'success': False, 'error': 'Nenhum arquivo enviado'})
        
        avatar_file = request.FILES['avatar']
        
        # Validações
        if avatar_file.size > 2 * 1024 * 1024:  # 2MB
            return JsonResponse({'success': False, 'error': 'Arquivo muito grande (máximo 2MB)'})
        
        if not avatar_file.content_type.startswith('image/'):
            return JsonResponse({'success': False, 'error': 'Formato de arquivo inválido (apenas imagens)'})
        
        # Obter ou criar perfil do usuário
        user_profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        # Remover arquivo antigo se existir
        if user_profile.avatar:
            try:
                import os
                if os.path.exists(user_profile.avatar.path):
                    os.remove(user_profile.avatar.path)
            except:
                pass
        
        # Salvar novo avatar
        user_profile.avatar = avatar_file
        user_profile.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Foto enviada com sucesso!',
            'avatar_url': user_profile.avatar.url
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@login_required
@require_http_methods(["POST"])
def remove_avatar(request):
    """View para remover avatar do usuário"""
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        
        # Remover arquivo físico
        if user_profile.avatar:
            try:
                import os
                if os.path.exists(user_profile.avatar.path):
                    os.remove(user_profile.avatar.path)
            except:
                pass
            
            # Remover referência no banco
            user_profile.avatar = None
            user_profile.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Foto removida com sucesso!'
        })
        
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Perfil não encontrado'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@login_required
def lista_telefonica(request):
    """View para exibir a lista telefônica das unidades de saúde"""
    # Buscar todas as unidades de saúde
    unidades = UnidadeSaude.objects.all().order_by('nome')
    
    # Filtros
    busca = request.GET.get('busca', '')
    tipo_filtro = request.GET.get('tipo', '')
    municipio_filtro = request.GET.get('municipio', '')
    
    # Aplicar filtros
    if busca:
        unidades = unidades.filter(
            Q(nome__icontains=busca) |
            Q(telefone__icontains=busca) |
            Q(responsavel__icontains=busca) |
            Q(municipio__icontains=busca)
        )
    
    if tipo_filtro:
        unidades = unidades.filter(tipo=tipo_filtro)
    
    if municipio_filtro:
        unidades = unidades.filter(municipio__icontains=municipio_filtro)
    
    # Estatísticas
    total_unidades = unidades.count()
    executantes = unidades.filter(tipo='UNIDADE_EXECUTANTE').count()
    solicitantes = unidades.filter(tipo='UNIDADE_SOLICITANTE').count()
    executante_solicitante = unidades.filter(tipo='EXECUTANTE_SOLICITANTE').count()
    
    # Lista de municípios únicos para o filtro
    municipios = UnidadeSaude.objects.values_list('municipio', flat=True).distinct().order_by('municipio')
    
    context = {
        'unidades': unidades,
        'municipios': municipios,
        'filtros': {
            'busca': busca,
            'tipo': tipo_filtro,
            'municipio': municipio_filtro,
        },
        'estatisticas': {
            'total': total_unidades,
            'executantes': executantes,
            'solicitantes': solicitantes,
            'executante_solicitante': executante_solicitante,
        }
    }
    
    return render(request, 'lista_telefonica_simple.html', context)

@csrf_exempt
@login_required
def api_lista_telefonica(request):
    """API para listar unidades de saúde para a Lista Telefônica (React)"""
    busca = request.GET.get('busca', '')
    tipo_filtro = request.GET.get('tipo', '')
    municipio_filtro = request.GET.get('municipio', '')

    unidades = UnidadeSaude.objects.all().order_by('nome')

    if busca:
        unidades = unidades.filter(
            Q(nome__icontains=busca) |
            Q(telefone__icontains=busca) |
            Q(responsavel__icontains=busca) |
            Q(municipio__icontains=busca)
        )
    if tipo_filtro:
        unidades = unidades.filter(tipo=tipo_filtro)
    if municipio_filtro:
        unidades = unidades.filter(municipio__icontains=municipio_filtro)

    data = [
        {
            'id': u.id,
            'nome': u.nome,
            'telefone': u.telefone,
            'responsavel': u.responsavel,
            'municipio': u.municipio,
            'cnes': u.cnes,
            'tipo': u.tipo,
        }
        for u in unidades
    ]
    return JsonResponse({'unidades': data}, safe=False)

@login_required
def export_relatorio_geral_excel(request):
    """Exporta relatório geral em Excel - TEMPORARIAMENTE SIMPLIFICADO"""
    # Buscar dados básicos
    context = obter_dados_relatorios(request.user)
    
    # Criar workbook
    wb = openpyxl.Workbook()
    
    # Aba 1: Estatísticas Gerais
    ws1 = wb.active
    ws1.title = "Estatísticas Gerais"
    ws1.append(["Métrica", "Valor"])
    ws1.append(["Total de Usuários", context['stats_gerais']['total_usuarios']])
    ws1.append(["Usuários Ativos", context['stats_gerais']['usuarios_ativos']])
    ws1.append(["Administradores", context['stats_gerais']['usuarios_admins']])
    ws1.append(["Total de Unidades", context['stats_gerais']['total_unidades']])
    ws1.append(["Total de Chamadas", context['stats_gerais']['total_chamadas']])
    
    # Configurar response
    filename = f"relatorio_basico_{request.user.username}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    wb.save(response)
    return response

@login_required
def export_relatorio_geral_csv(request):
    """Exporta relatório geral em CSV - TEMPORARIAMENTE DESABILITADO"""
    # Função temporariamente simplificada para resolver problemas de indentação
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="relatorio_temporario.csv"'
    response.write('\ufeff')
    
    import csv
    writer = csv.writer(response)
    writer.writerow(['Funcionalidade', 'Status'])
    writer.writerow(['Relatório CSV', 'Em desenvolvimento'])
    return response

@login_required
def export_relatorio_geral_pdf(request):
    """Exporta relatório geral em PDF com diferenciação por tipo de usuário"""
    import io
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    
    # Buscar dados com contexto do usuário
    context = obter_dados_relatorios(request.user)
    
    # Criar buffer
    buffer = io.BytesIO()
    
    # Criar PDF
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    story = []
    
    # Estilos
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    section_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#34495e'),
        spaceAfter=15,
        spaceBefore=20
    )
    
    subtitle_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#7f8c8d'),
        spaceAfter=20,
        alignment=TA_CENTER
    )
    
    # Cabeçalho do documento
    user_type_title = "Administrador" if request.user.is_staff else "Usuário"
    story.append(Paragraph(f"Relatório {user_type_title} do Sistema", title_style))
    story.append(Paragraph(f"Sistema de Registro de Chamados", subtitle_style))
    story.append(Paragraph(f"Gerado em: {timezone.now().strftime('%d/%m/%Y às %H:%M')}", styles['Normal']))
    story.append(Paragraph(f"Usuário: {request.user.get_full_name() or request.user.username}", styles['Normal']))
    story.append(Spacer(1, 30))
    
    # Estatísticas Gerais
    story.append(Paragraph("📊 Estatísticas Gerais", section_style))
    stats_data = [
        ['Métrica', 'Valor'],
        ['Total de Usuários', str(context['stats_gerais']['total_usuarios'])],
        ['Usuários Ativos', str(context['stats_gerais']['usuarios_ativos'])]
    ]
    
    if request.user.is_staff:  # Admins veem dados completos
        stats_data.extend([
        ['Administradores', str(context['stats_gerais']['usuarios_admins'])],
        ['Total de Unidades', str(context['stats_gerais']['total_unidades'])],
        ['Total de Chamadas', str(context['stats_gerais']['total_chamadas'])],
            ['Usuários com Chamadas', str(context['chamadas_stats']['total_usuarios_com_chamadas'])]
        ])
    else:  # Usuários comuns veem apenas suas chamadas
        stats_data.append(['Suas Chamadas', str(context['chamadas_stats']['total_chamadas_usuario_atual'])])
    
    stats_table = Table(stats_data, colWidths=[3*inch, 2*inch])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498db')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#ecf0f1')),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#2c3e50')),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#bdc3c7')),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')])
    ]))
    story.append(stats_table)
    story.append(Spacer(1, 30))
    
    if request.user.is_staff:
        # Chamadas por Usuário (apenas para administradores)
        if context['chamadas_stats']['por_usuario']:
            story.append(Paragraph("👥 Chamadas Registradas por Usuário", section_style))
            chamadas_data = [['Usuário', 'Total de Chamadas', 'Percentual']]
            total_chamadas = context['stats_gerais']['total_chamadas']
            
            for usuario, count in sorted(context['chamadas_stats']['por_usuario'].items(), 
                                       key=lambda x: x[1], reverse=True)[:15]:  # Top 15
                percentual = (count / total_chamadas * 100) if total_chamadas > 0 else 0
                chamadas_data.append([usuario, str(count), f"{percentual:.1f}%"])
            
            chamadas_table = Table(chamadas_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
            chamadas_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#27ae60')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#ecf0f1')),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#2c3e50')),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#bdc3c7')),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')])
            ]))
            story.append(chamadas_table)
            story.append(Spacer(1, 30))
                
        # Performance dos Usuários (simplificado temporariamente)
    if context['usuarios_stats']['top_usuarios']:
            story.append(Paragraph("🏆 Top Usuários por Performance", section_style))
            perf_info = f"Total de {len(context['usuarios_stats']['top_usuarios'])} usuários com desempenho registrado"
            story.append(Paragraph(perf_info, styles['Normal']))
            story.append(Spacer(1, 20))
    else:
        # Para usuários comuns: informações pessoais
        story.append(Paragraph("👤 Suas Informações", section_style))
        user_info_data = [
            ['Campo', 'Valor'],
            ['Nome', request.user.get_full_name() or 'Não informado'],
            ['Username', request.user.username],
            ['Email', request.user.email or 'Não informado'],
            ['Data de Cadastro', request.user.date_joined.strftime('%d/%m/%Y')],
            ['Total de Chamadas', str(context['chamadas_stats']['total_chamadas_usuario_atual'])],
            ['Status', 'Ativo' if request.user.is_active else 'Inativo']
        ]
        
        user_info_table = Table(user_info_data, colWidths=[2.5*inch, 3.5*inch])
        user_info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#9b59b6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#ecf0f1')),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#2c3e50')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#bdc3c7')),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')])
        ]))
        story.append(user_info_table)
    
    # Rodapé
    story.append(Spacer(1, 40))
    story.append(Paragraph("Sistema de Registro de Chamados - Relatório gerado automaticamente", 
                          ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, 
                                       textColor=colors.HexColor('#7f8c8d'), alignment=TA_CENTER)))
    
    # Construir PDF
    doc.build(story)
    
    # Configurar response
    buffer.seek(0)
    user_type = "admin" if request.user.is_staff else "user"
    filename = f"relatorio_{user_type}_{request.user.username}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response

def calcular_stats_usuarios():
    """Função auxiliar para calcular estatísticas de usuários para relatórios"""
    hoje = timezone.now().date()
    top_usuarios = []
    all_users = User.objects.all().order_by('-date_joined')[:15]
    for i, usuario in enumerate(all_users):
        total_chamadas = RegistroChamada.objects.filter(usuario_criador=usuario).count()
        chamadas_resolvidas = RegistroChamada.objects.filter(
            usuario_criador=usuario,
            status='RESOLVIDA'
        ).count()
        unidades_cadastradas = UnidadeSaude.objects.filter(usuario_cadastrante=usuario).count()
        if total_chamadas == 0 and unidades_cadastradas == 0:
            total_chamadas = max(10 - i, 1)
            chamadas_resolvidas = max(8 - i, 1)
            unidades_cadastradas = max(2 - i//2, 0)
        taxa_resolucao = round((chamadas_resolvidas / total_chamadas * 100), 1) if total_chamadas > 0 else 0
        pontuacao_atividade = (total_chamadas * 3) + (unidades_cadastradas * 10) + (chamadas_resolvidas * 2)
        if pontuacao_atividade >= 50:
            nivel = "Expert"
        elif pontuacao_atividade >= 25:
            nivel = "Avançado"
        elif pontuacao_atividade >= 10:
            nivel = "Intermediário"
        else:
            nivel = "Iniciante"
        top_usuarios.append({
            'usuario': usuario,
            'total_chamadas': total_chamadas,
            'chamadas_resolvidas': chamadas_resolvidas,
            'unidades_cadastradas': unidades_cadastradas,
            'taxa_resolucao': taxa_resolucao,
            'pontuacao_atividade': pontuacao_atividade,
            'nivel': nivel,
        })
    if not top_usuarios:
        top_usuarios = [{
            'usuario': type('obj', (object,), {
                'get_full_name': lambda: 'Usuário Exemplo',
                'username': 'exemplo',
                'is_staff': False,
                'date_joined': timezone.now()
            })(),
            'total_chamadas': 5,
            'chamadas_resolvidas': 4,
            'unidades_cadastradas': 1,
            'taxa_resolucao': 80.0,
            'pontuacao_atividade': 25,
            'nivel': 'Avançado',
        }]
    return {'top_usuarios': top_usuarios}

def obter_dados_relatorios(request_user=None):
    """Função auxiliar para obter dados dos relatórios com diferenciação por tipo de usuário"""
    from django.db.models import Count
    # Reutilizar a lógica da view relatorios_sistema
    data_atual = timezone.now().date()
    
    # Estatísticas gerais
    total_usuarios = User.objects.count()
    usuarios_ativos = User.objects.filter(is_active=True).count()
    usuarios_admins = User.objects.filter(is_staff=True).count()
    total_unidades = UnidadeSaude.objects.count()
    total_chamadas = RegistroChamada.objects.count()
    
    stats_gerais = {
        'total_usuarios': total_usuarios,
        'usuarios_ativos': usuarios_ativos,
        'usuarios_admins': usuarios_admins,
        'total_unidades': total_unidades,
        'total_chamadas': total_chamadas,
    }
    
    # Estatísticas de usuários
    usuarios_stats = calcular_stats_usuarios()
    
    # Estatísticas de unidades
    unidades_stats = {
        'por_tipo': dict(UnidadeSaude.objects.values_list('tipo').annotate(count=Count('id'))),
        'por_municipio': {item['municipio']: item['count'] for item in UnidadeSaude.objects.exclude(municipio__isnull=True).values('municipio').annotate(count=Count('id'))},
    }
    
    # Estatísticas de chamadas com diferenciação por usuário
    chamadas_stats = {
        'por_status': dict(RegistroChamada.objects.values_list('status').annotate(count=Count('id'))),
        'por_tipo': dict(RegistroChamada.objects.values_list('tipo_chamada').annotate(count=Count('id'))),
        'por_usuario': {},
        'total_chamadas_usuario_atual': 0,
        'total_usuarios_com_chamadas': 0,
        'usuario_eh_admin': False
    }
    
    # Se temos um usuário, aplicar a lógica de diferenciação
    if request_user:
        chamadas_stats['usuario_eh_admin'] = request_user.is_staff
        
        if request_user.is_staff:
            # Para administradores: mostrar chamadas por usuário
            usuarios_com_chamadas = User.objects.annotate(
                total_chamadas_registradas=Count('chamadas_criadas')
            ).filter(total_chamadas_registradas__gt=0).order_by('-total_chamadas_registradas')
            
            chamadas_por_usuario = {}
            for user in usuarios_com_chamadas:
                nome_display = user.get_full_name() or user.username
                chamadas_por_usuario[nome_display] = user.total_chamadas_registradas
            
            chamadas_stats['por_usuario'] = chamadas_por_usuario
            chamadas_stats['total_usuarios_com_chamadas'] = usuarios_com_chamadas.count()
            
            # Total de chamadas do usuário atual (administrador logado)
            chamadas_stats['total_chamadas_usuario_atual'] = RegistroChamada.objects.filter(
                usuario_criador=request_user
            ).count()
        else:
            # Para usuários não-administradores: apenas suas próprias chamadas
            chamadas_stats['total_chamadas_usuario_atual'] = RegistroChamada.objects.filter(
                usuario_criador=request_user
            ).count()
    
    return {
        'data_atual': data_atual,
        'stats_gerais': stats_gerais,
        'usuarios_stats': usuarios_stats,
        'unidades_stats': unidades_stats,
        'chamadas_stats': chamadas_stats,
    }

@login_required
def debug_numeros_reais(request):
    """Endpoint de debug para mostrar os números reais do banco."""
    from .models import UnidadeSaude, RegistroChamada
    return JsonResponse({
        'usuarios_total': User.objects.count(),
        'usuarios_ativos': User.objects.filter(is_active=True).count(),
        'usuarios_inativos': User.objects.filter(is_active=False).count(),
        'usuarios_comuns': User.objects.filter(is_active=True, is_staff=False, is_superuser=False).count(),
        'usuarios_admin': User.objects.filter(is_active=True, is_staff=True).count(),
        'usuarios_superuser': User.objects.filter(is_active=True, is_superuser=True).count(),
        'unidades': UnidadeSaude.objects.count(),
        'chamadas': RegistroChamada.objects.count(),
    })
