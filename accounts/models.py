from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
import os

def user_avatar_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f'user_{instance.user.id}_avatar.{ext}'
    return os.path.join('avatars', filename)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(
        upload_to=user_avatar_path,
        blank=True,
        null=True,
        verbose_name='Foto de Perfil',
        help_text='Foto do usuário (formatos: JPG, PNG, máximo 2MB)'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Perfil de Usuário'
        verbose_name_plural = 'Perfis de Usuários'

    def __str__(self):
        return f'Perfil de {self.user.username}'

    def get_avatar_url(self):
        if self.avatar:
            return self.avatar.url
        return None

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()

class RegistroChamada(models.Model):
    TIPO_CHOICES = [
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
        ('emergencia', 'Emergência'),
        ('consulta', 'Consulta'),
        ('informacao', 'Informação'),
        ('reclamacao', 'Reclamação'),
        ('outros', 'Outros'),
    ]

    STATUS_CHOICES = [
        ('chamada_recebida', 'Chamada Recebida'),
        ('chamada_efetuada', 'Chamada Efetuada'),
    ]

    # Dados do Contato
    nome_contato = models.CharField(max_length=255, verbose_name='Nome do Contato')
    telefone = models.CharField(max_length=20, verbose_name='Telefone')
    funcao = models.CharField(max_length=100, null=True, blank=True, verbose_name='Função/Cargo')
    setor = models.CharField(max_length=100, null=True, blank=True, verbose_name='Setor de Atuação')

    # Dados da Chamada
    tipo_chamada = models.CharField(max_length=50, choices=TIPO_CHOICES, verbose_name='Tipo de Chamada')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, verbose_name='Status')
    nome_atendente = models.CharField(max_length=255, verbose_name='Nome do Atendente')
    descricao = models.TextField(verbose_name='Descrição da Solicitação')
    solucao = models.TextField(null=True, blank=True, verbose_name='Solução/Encaminhamento')

    # Unidade de Saúde
    unidade = models.CharField(max_length=255, verbose_name='Nome da Unidade')
    municipio = models.CharField(max_length=100, null=True, blank=True, verbose_name='Município')
    cnes = models.CharField(max_length=7, null=True, blank=True, verbose_name='Código CNES')
    contato_telefonico_cnes = models.CharField(max_length=20, null=True, blank=True, verbose_name='Contato Telefônico CNES')

    # Metadados
    data_criacao = models.DateTimeField(auto_now_add=True, verbose_name='Data de Criação')
    data_atualizacao = models.DateTimeField(auto_now=True, verbose_name='Data de Atualização')
    usuario_criador = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='chamadas_criadas',
        verbose_name='Usuário Criador'
    )

    class Meta:
        verbose_name = 'Registro de Chamada'
        verbose_name_plural = 'Registros de Chamadas'
        ordering = ['-data_criacao']

    def __str__(self):
        return f"Chamada {self.tipo_chamada} - {self.data_criacao.strftime('%d/%m/%Y %H:%M')}"

class UnidadeSaude(models.Model):
    TIPO_CHOICES = [
        ('UNIDADE_EXECUTANTE', 'Unidade Executante'),
        ('UNIDADE_SOLICITANTE', 'Unidade Solicitante'),
        ('EXECUTANTE_SOLICITANTE', 'Executante/Solicitante'),
    ]

    nome = models.CharField(max_length=200)
    municipio = models.CharField(max_length=100, default="Não informado", help_text="Município onde a unidade está localizada")
    cnes = models.CharField(max_length=7, unique=True, null=True, blank=True, help_text="Número CNES da Unidade de Saúde")
    tipo = models.CharField(max_length=25, choices=TIPO_CHOICES, default='UNIDADE_EXECUTANTE')
    contato_telefonico = models.CharField(max_length=20, null=True, blank=True, verbose_name="Contato Telefônico", help_text="Telefone de contato da unidade")
    endereco = models.TextField()
    telefone = models.CharField(max_length=20)
    responsavel = models.CharField(max_length=200, null=True, blank=True)
    email = models.EmailField(blank=True, null=True)
    horario_funcionamento = models.TextField()
    servicos_emergencia = models.BooleanField(default=False)
    created_at = models.DateTimeField('Data de Cadastro', auto_now_add=True)
    updated_at = models.DateTimeField('Última Atualização', auto_now=True)
    usuario_cadastrante = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='unidades_cadastradas',
        verbose_name='Usuário Cadastrante',
        help_text='Usuário que cadastrou esta unidade no sistema'
    )

    class Meta:
        verbose_name = 'Unidade de Saúde'
        verbose_name_plural = 'Unidades de Saúde'
        ordering = ['nome']

    def __str__(self):
        return self.nome
