from django.db import models

class Municipio(models.Model):
    nome = models.CharField(max_length=100, unique=True, verbose_name="Nome do Município")
    estado = models.CharField(max_length=2, default="MS", verbose_name="Estado")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última Atualização")

    class Meta:
        verbose_name = "Município"
        verbose_name_plural = "Municípios"
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} - {self.estado}" 