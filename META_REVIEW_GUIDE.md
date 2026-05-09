# Guia de Aprovação na Meta (App Review) - Agência Invisível

Este guia detalha os passos necessários para obter as permissões de anúncios (`ads_management`, `ads_read`, `business_management`) para sua aplicação.

## 1. Política de Privacidade (Sugestão de Texto)
Copie e adapte o texto abaixo para uma página acessível publicamente (ex: `agenciainvisivel.com/privacy`):

> **Política de Privacidade - Agência Invisível**
> 
> A Agência Invisível valoriza sua privacidade. Nosso aplicativo solicita acesso às suas contas de anúncios do Facebook para simplificar a criação e gestão de campanhas.
> 
> 1. **Dados Coletados:** Coletamos apenas o seu Nome, E-mail e Tokens de Acesso do Facebook.
> 2. **Uso dos Dados:** Seus tokens são usados exclusivamente para criar campanhas, conjuntos de anúncios e anúncios conforme solicitado por você no painel.
> 3. **Compartilhamento:** Não compartilhamos seus dados com terceiros.
> 4. **Exclusão:** Você pode solicitar a exclusão de seus dados a qualquer momento enviando um e-mail para suporte@agenciainvisivel.com.

## 2. Script para o Vídeo de Demonstração (2 minutos)
A Meta exige um vídeo mostrando o fluxo de login e a funcionalidade premium.

**Cena 1 (0:00 - 0:30):**
"Olá, sou [Nome] da Agência Invisível. Nossa plataforma ajuda pequenos empreendedores a criarem anúncios no Meta com IA. Aqui está a nossa Landing Page com o botão de conexão."
*(Mostre a Landing Page e clique em 'Começar Agora')*

**Cena 2 (0:30 - 1:00):**
"O usuário clica em 'Conectar Conta Meta'. Note que solicitamos apenas as permissões necessárias para gerenciar anúncios. Após o login seguro via OAuth, o usuário é redirecionado para o dashboard simplificado."
*(Mostre o popup de login do Facebook e o redirecionamento)*

**Cena 3 (1:00 - 2:00):**
"Agora, o usuário descreve seu produto. EX: 'Vendo marmitas fitness'. A nossa IA gera instantaneamente a headline, o texto e os interesses. Ao clicar em 'Publicar Agora', nossa plataforma usa a Meta API para criar a estrutura completa na conta de anúncios do cliente, economizando horas de configuração técnica."
*(Mostre a geração do anúncio e o clique no botão de publicação)*

## 3. Instruções para o Formulário de "App Review"

Ao preencher o formulário no Facebook Developers, use estas justificativas:

- **ads_management:** "Nossa aplicação permite que usuários leigos publiquem campanhas de tráfego diretamente de uma interface simplificada, sem precisar navegar pela complexidade do Gerenciador de Anúncios padrão."
- **ads_read:** "Necessário para listar as contas de anúncios ativas do usuário e permitir que ele escolha onde o anúncio deve ser veiculado."
- **business_management:** "Usado para verificar a vinculação entre a conta de anúncios e a página do Facebook do usuário, garantindo que o anúncio seja publicado corretamente."

---

# Estratégia de Onboarding (Task 3)

Para garantir fricção zero:
1. **Pós-Pagamento:** Se você usar Stripe ou Kiwify, configure a `URL de Retorno` para `agenciainvisivel.com/dashboard?session=success`.
2. **Auto-Trigger:** No código do frontend, se detectarmos que o usuário acabou de pagar mas não tem `accessToken`, abrimos automaticamente o modal de conexão do Facebook.
3. **Detecção Automática:** O backend já está configurado para receber o token e o frontend armazena no estado. Em produção, você deve salvar esse token em um banco de dados (Firestore) vinculado ao e-mail do usuário.
