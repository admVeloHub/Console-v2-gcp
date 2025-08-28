// Toggle de tema
document.getElementById('theme-toggle').addEventListener('click', function() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
});

// Função para navegar entre páginas
function navigateTo(page) {
    window.location.href = `./${page}.html`;
}

// Função para mostrar tabs
function showTab(tabName) {
    // Esconder todas as tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remover classe active de todos os botões
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));
    
    // Mostrar tab selecionada
    document.getElementById(tabName).classList.add('active');
    
    // Adicionar classe active ao botão clicado
    event.target.classList.add('active');
}

// Função para mostrar status
function showStatus(message, type = 'success') {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
    
    // Limpar status após 5 segundos
    setTimeout(() => {
        statusDiv.innerHTML = '';
    }, 5000);
}

// Função para mostrar toast de erro
function showErrorToast(message) {
    // Remover toast existente se houver
    const existingToast = document.querySelector('.error-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Criar novo toast
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Mostrar toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remover toast após 5 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 5000);
}

// Função para mostrar feedback visual
function showFeedback(type = 'loading') {
    const overlay = document.getElementById('feedback-overlay');
    const spinner = document.getElementById('spinner');
    const successGif = document.getElementById('success-gif');
    const message = document.getElementById('feedback-message');
    const subtitle = document.getElementById('feedback-subtitle');
    
    // Reset todos os elementos
    spinner.style.display = 'none';
    successGif.style.display = 'none';
    
    if (type === 'loading') {
        spinner.style.display = 'block';
        message.textContent = 'Enviando...';
        subtitle.textContent = 'Aguarde um momento';
        overlay.classList.add('show');
    } else if (type === 'success') {
        successGif.style.display = 'block';
        message.textContent = 'Sucesso!';
        subtitle.textContent = 'Dados salvos com sucesso';
        overlay.classList.add('show');
    }
}

// Função para esconder feedback
function hideFeedback() {
    const overlay = document.getElementById('feedback-overlay');
    overlay.classList.remove('show');
}

// Função para fazer fade out do formulário
function fadeOutForm() {
    const form = document.querySelector('.dashboard-card');
    form.classList.add('form-fade-out');
}

// Função para enviar dados
async function submitData(collection, data) {
    try {
        // Mostrar loading
        showFeedback('loading');
        
        // Fade out do formulário
        setTimeout(fadeOutForm, 300);
        
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ collection, data })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Mostrar sucesso com GIF
            setTimeout(() => {
                showFeedback('success');
            }, 1000);
            
            // Esconder feedback após 4 segundos (para dar tempo do GIF)
            setTimeout(() => {
                hideFeedback();
                // Resetar formulário
                const form = document.querySelector('form');
                if (form) form.reset();
                // Remover fade out
                const card = document.querySelector('.dashboard-card');
                if (card) card.classList.remove('form-fade-out');
            }, 4000);
            
            return true;
        } else {
            // Mostrar toast de erro
            showErrorToast(result.message || 'Falha ao salvar dados');
            // Remover fade out
            const card = document.querySelector('.dashboard-card');
            if (card) card.classList.remove('form-fade-out');
            
            return false;
        }
    } catch (error) {
        // Mostrar toast de erro
        showErrorToast('Erro de conexão. Tente novamente.');
        // Remover fade out
        const card = document.querySelector('.dashboard-card');
        if (card) card.classList.remove('form-fade-out');
        
        return false;
    }
}

// Formulário Artigos
document.getElementById('form-artigos').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const keywords = document.getElementById('artigo-keywords').value;
    const keywordsArray = keywords ? keywords.split(',').map(k => k.trim()) : [];
    
    const categoryValue = document.getElementById('artigo-category').value;
    const categoryText = document.getElementById('artigo-category').options[document.getElementById('artigo-category').selectedIndex].text;
    
    const data = {
        title: document.getElementById('artigo-title').value,
        content: document.getElementById('artigo-content').value,
        category: categoryText,
        category_id: categoryValue,
        keywords: keywordsArray
    };
    
    const success = await submitData('Artigos', data);
    if (success) {
        this.reset();
    }
});

// Formulário Velonews
document.getElementById('form-velonews').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const data = {
        title: document.getElementById('velonews-title').value,
        content: document.getElementById('velonews-content').value,
        is_critical: document.getElementById('velonews-critical').checked ? 'Y' : 'N'
    };
    
    const success = await submitData('Velonews', data);
    if (success) {
        this.reset();
        document.getElementById('velonews-critical').checked = false;
    }
});

// Formulário Bot Perguntas
document.getElementById('form-bot-perguntas').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const data = {
        topic: document.getElementById('bot-topic').value,
        context: document.getElementById('bot-context').value,
        keywords: document.getElementById('bot-keywords').value,
        question: document.getElementById('bot-question').value,
        imageUrls: document.getElementById('bot-image-urls').value
    };
    
    const success = await submitData('Bot_perguntas', data);
    if (success) {
        this.reset();
    }
});
