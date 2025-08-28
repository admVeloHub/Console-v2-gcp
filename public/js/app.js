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

// Função para enviar dados
async function submitData(collection, data) {
    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ collection, data })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showStatus('✅ Dados salvos com sucesso!');
            return true;
        } else {
            showStatus('❌ Erro ao salvar dados: ' + result.message, 'error');
            return false;
        }
    } catch (error) {
        showStatus('❌ Erro de conexão: ' + error.message, 'error');
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
