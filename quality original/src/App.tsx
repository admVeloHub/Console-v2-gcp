import { useState, useEffect } from 'react';
import { Funcionario, FuncionarioFormData, Acesso, AcessoFormData } from './types';
import { getFuncionarios, addFuncionario, updateFuncionario, deleteFuncionario, generateId } from './utils/storage';
import { exportToExcel, exportToPDF } from './utils/export';
import { syncNow, getSyncStatus } from './utils/autoSync';
import Header from './components/Header';
import ModuleSelector from './components/ModuleSelector';
import FuncionarioList from './components/FuncionarioList';
import FuncionarioForm from './components/FuncionarioForm';
import FuncionarioToolbar from './components/FuncionarioToolbar';
import QualidadeModule from './components/QualidadeModule';
import QualidadeToolbar from './components/QualidadeToolbar';
import AcessoForm from './components/AcessoForm';

function App() {
	const [currentView, setCurrentView] = useState<'selector' | 'funcionarios' | 'qualidade'>('selector');
	const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
	const [showFuncionarioForm, setShowFuncionarioForm] = useState(false);
	const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
	const [syncStatus, setSyncStatus] = useState(getSyncStatus());
	const [isSyncing, setIsSyncing] = useState(false);
	
	// Estados para gerenciamento de acessos
	const [showAcessoForm, setShowAcessoForm] = useState(false);
	const [selectedFuncionarioId, setSelectedFuncionarioId] = useState<string>('');
	const [editingAcesso, setEditingAcesso] = useState<Acesso | null>(null);

	// Estados para filtros
	const [filtros, setFiltros] = useState({
		nome: '',
		empresa: '',
		atuacao: '',
		status: 'todos' as 'todos' | 'ativos' | 'desligados' | 'afastados',
		escala: ''
	});
	// const [showFiltros, setShowFiltros] = useState(false); // Removido - não utilizado

	const reloadFuncionarios = () => {
		const data = getFuncionarios();
		setFuncionarios(data);
	};

	// Função para atualizar filtros
	const handleFiltroChange = (campo: keyof typeof filtros, valor: string) => {
		setFiltros(prev => ({ ...prev, [campo]: valor }));
	};

	// Função para limpar filtros
	const limparFiltros = () => {
		setFiltros({
			nome: '',
			empresa: '',
			atuacao: '',
			status: 'todos',
			escala: ''
		});
	};

	// Função para sincronização manual
	const handleManualSync = async () => {
		if (isSyncing) return;
		
		setIsSyncing(true);
		try {
			console.log('🔄 Iniciando sincronização manual...');
			const result = await syncNow();
			
			if (result.success) {
				console.log('✅ Sincronização bem-sucedida:', result.message);
				if (result.data) {
					setFuncionarios(result.data);
				}
				// Atualizar status
				setSyncStatus(getSyncStatus());
			} else {
				console.error('❌ Falha na sincronização:', result.message);
			}
		} catch (error) {
			console.error('❌ Erro durante sincronização:', error);
		} finally {
			setIsSyncing(false);
		}
	};

	// Funções para gerenciamento de acessos
	const handleAddAcesso = (funcionarioId: string) => {
		setSelectedFuncionarioId(funcionarioId);
		setEditingAcesso(null);
		setShowAcessoForm(true);
	};

	const handleEditAcesso = (funcionarioId: string, acesso: Acesso) => {
		setSelectedFuncionarioId(funcionarioId);
		setEditingAcesso(acesso);
		setShowAcessoForm(true);
	};

	const handleDeleteAcesso = (funcionarioId: string, acessoId: string) => {
		if (confirm('Tem certeza que deseja excluir este acesso?')) {
			const funcionario = funcionarios.find(f => f.id === funcionarioId);
			if (funcionario) {
				const acessosAtualizados = funcionario.acessos.filter(a => a.id !== acessoId);
				const funcionarioAtualizado = { ...funcionario, acessos: acessosAtualizados };
				
				updateFuncionario(funcionarioId, funcionarioAtualizado);
				setFuncionarios(prev => prev.map(f => 
					f.id === funcionarioId ? funcionarioAtualizado : f
				));
				
				console.log('✅ Acesso excluído. Use o botão "Sincronizar" para sincronizar com outros acessos.');
			}
		}
	};

	const handleSubmitAcesso = (data: AcessoFormData) => {
		const funcionario = funcionarios.find(f => f.id === selectedFuncionarioId);
		if (!funcionario) return;

		if (editingAcesso) {
			// Editando acesso existente
			const acessosAtualizados = funcionario.acessos.map(a => 
				a.id === editingAcesso.id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
			);
			const funcionarioAtualizado = { ...funcionario, acessos: acessosAtualizados };
			
			updateFuncionario(selectedFuncionarioId, funcionarioAtualizado);
			setFuncionarios(prev => prev.map(f => 
				f.id === selectedFuncionarioId ? funcionarioAtualizado : f
			));
			
			console.log('✅ Acesso editado. Use o botão "Sincronizar" para sincronizar com outros acessos.');
		} else {
			// Adicionando novo acesso
			const novoAcesso: Acesso = {
				id: generateId(),
				...data,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			};
			
			const acessosAtualizados = [...funcionario.acessos, novoAcesso];
			const funcionarioAtualizado = { ...funcionario, acessos: acessosAtualizados };
			
			updateFuncionario(selectedFuncionarioId, funcionarioAtualizado);
			setFuncionarios(prev => prev.map(f => 
				f.id === selectedFuncionarioId ? funcionarioAtualizado : f
			));
			
			console.log('✅ Acesso adicionado. Use o botão "Sincronizar" para sincronizar com outros acessos.');
		}
		
		setShowAcessoForm(false);
		setSelectedFuncionarioId('');
		setEditingAcesso(null);
	};

	// Funções para filtros
	const aplicarFiltros = (funcionarios: Funcionario[]) => {
		const funcionariosFiltrados = funcionarios.filter(funcionario => {
			// Filtro por nome
			if (filtros.nome && !funcionario.nomeCompleto.toLowerCase().includes(filtros.nome.toLowerCase())) {
				return false;
			}
			
			// Filtro por empresa
			if (filtros.empresa && funcionario.empresa !== filtros.empresa) {
				return false;
			}
			
			// Filtro por atuação
			if (filtros.atuacao && funcionario.atuacao !== filtros.atuacao) {
				return false;
			}
			
			// Filtro por escala
			if (filtros.escala && funcionario.escala !== filtros.escala) {
				return false;
			}
			
			// Filtro por status
			if (filtros.status !== 'todos') {
				switch (filtros.status) {
					case 'ativos':
						if (funcionario.desligado || funcionario.afastado) return false;
						break;
					case 'desligados':
						if (!funcionario.desligado) return false;
						break;
					case 'afastados':
						if (!funcionario.afastado) return false;
						break;
				}
			}
			
			return true;
		});

		// Ordenar por nome alfabeticamente
		return funcionariosFiltrados.sort((a, b) => 
			a.nomeCompleto.localeCompare(b.nomeCompleto, 'pt-BR')
		);
	};

	const funcionariosFiltrados = aplicarFiltros(funcionarios);

	useEffect(() => {
		reloadFuncionarios();
		
		// Listener para atualizações automáticas (quando dados são alterados localmente)
		const handleFuncionariosUpdated = (event: CustomEvent) => {
			console.log('🔄 Atualização recebida:', event.detail);
			setFuncionarios(event.detail.funcionarios);
			setSyncStatus(getSyncStatus());
		};
		
		// Listener para sincronização entre abas/instâncias (BroadcastChannel)
		const syncChannel = new BroadcastChannel('velotax-sync');
		const handleBroadcastSync = (event: MessageEvent) => {
			if (event.data.type === 'DATA_UPDATED') {
				console.log('📡 Sincronização automática recebida via BroadcastChannel:', event.data);
				const syncData = event.data.data;
				if (syncData && syncData.funcionarios) {
					setFuncionarios(syncData.funcionarios);
					setSyncStatus(getSyncStatus());
					
					// Atualizar localStorage local também
					localStorage.setItem('funcionarios_velotax', JSON.stringify(syncData.funcionarios));
				}
			}
		};
		
		window.addEventListener('funcionariosUpdated', handleFuncionariosUpdated as EventListener);
		syncChannel.addEventListener('message', handleBroadcastSync);
		
		// Cleanup
		return () => {
			window.removeEventListener('funcionariosUpdated', handleFuncionariosUpdated as EventListener);
			syncChannel.removeEventListener('message', handleBroadcastSync);
			syncChannel.close();
		};
	}, []);

	const handleSelectModule = (moduleName: string) => {
		if (moduleName === 'funcionarios') setCurrentView('funcionarios');
		if (moduleName === 'qualidade') setCurrentView('qualidade');
		if (moduleName === 'migracao') setCurrentView('funcionarios');
	};

	const handleBackToSelector = () => setCurrentView('selector');

	const handleSubmitFuncionario = (data: FuncionarioFormData) => {
		if (editingFuncionario) {
			const updated = updateFuncionario(editingFuncionario.id, { ...data });
			if (updated) {
				setFuncionarios(prev => prev.map(f => f.id === editingFuncionario.id ? updated : f));
				// Notificar que dados foram alterados (sincronização manual será feita pelo usuário)
				console.log('✅ Funcionário editado. Use o botão "Sincronizar" para sincronizar com outros acessos.');
			}
		} else {
			const novo = addFuncionario({ ...data, acessos: [] });
			setFuncionarios(prev => [...prev, novo]);
			// Notificar que dados foram alterados (sincronização manual será feita pelo usuário)
			console.log('✅ Funcionário adicionado. Use o botão "Sincronizar" para sincronizar com outros acessos.');
		}
		setShowFuncionarioForm(false);
		setEditingFuncionario(null);
	};

	const handleDeleteFuncionario = (id: string) => {
		deleteFuncionario(id);
		setFuncionarios(prev => prev.filter(f => f.id !== id));
		// Notificar que dados foram alterados (sincronização manual será feita pelo usuário)
		console.log('✅ Funcionário excluído. Use o botão "Sincronizar" para sincronizar com outros acessos.');
	};

	if (currentView === 'selector') {
		return (
			<div className="min-h-screen bg-[#ECECEC]">
				<Header onBackToSelector={handleBackToSelector} />
				<ModuleSelector onSelectModule={handleSelectModule} />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#ECECEC]">
			<Header 
				onBackToSelector={handleBackToSelector}
				syncStatus={syncStatus}
				onSyncClick={handleManualSync}
				isSyncing={isSyncing}
			/>

			<div className="w-full px-2 sm:px-3 lg:px-4 py-3">
				{currentView === 'funcionarios' && (
					<>
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
							<div className="flex items-center justify-between">
								<div>
									<h1 className="text-xl font-semibold text-gray-800">Gestão de Funcionários</h1>
									<p className="text-sm text-gray-600">Gerencie o cadastro de colaboradores</p>
								</div>
								<button
									onClick={() => setShowFuncionarioForm(true)}
									className="px-3 py-2 bg-[#000058] text-white rounded-lg hover:opacity-90 transition-colors text-sm"
								>
									Novo Funcionário
								</button>
							</div>
						</div>

						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
							<FuncionarioToolbar 
								funcionarios={funcionarios}
								onExportExcel={() => exportToExcel(funcionarios)} 
								onExportPDF={() => exportToPDF(funcionarios)} 
								onDataImported={reloadFuncionarios}
							/>
						</div>

						<div className="bg-white rounded-lg shadow-sm border border-gray-200">
							<FuncionarioList
								funcionarios={funcionariosFiltrados}
								filtros={filtros}
								onFiltroChange={handleFiltroChange}
								onLimparFiltros={limparFiltros}
								onEdit={(funcionario) => {
									setEditingFuncionario(funcionario);
									setShowFuncionarioForm(true);
								}}
								onDelete={handleDeleteFuncionario}
								onAddAcesso={handleAddAcesso}
								onEditAcesso={handleEditAcesso}
								onDeleteAcesso={handleDeleteAcesso}
							/>
						</div>

						{showFuncionarioForm && (
							<FuncionarioForm
								initialData={editingFuncionario || undefined}
								isEditing={!!editingFuncionario}
								onSubmit={handleSubmitFuncionario}
								onCancel={() => {
									setShowFuncionarioForm(false);
									setEditingFuncionario(null);
								}}
							/>
						)}

						{showAcessoForm && (
							<AcessoForm
								funcionarioNome={funcionarios.find(f => f.id === selectedFuncionarioId)?.nomeCompleto || ''}
								initialData={editingAcesso || undefined}
								isEditing={!!editingAcesso}
								onSubmit={handleSubmitAcesso}
								onCancel={() => {
									setShowAcessoForm(false);
									setSelectedFuncionarioId('');
									setEditingAcesso(null);
								}}
							/>
						)}
					</>
				)}

				{currentView === 'qualidade' && (
					<>
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
							<div className="flex items-center justify-between">
								<div>
									<h1 className="text-xl font-semibold text-gray-800">Módulo de Qualidade</h1>
									<p className="text-sm text-gray-600">Monitoramento e avaliação de atendimentos</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
							<QualidadeToolbar 
								onExportExcel={() => exportToExcel(funcionarios)} 
								onExportPDF={() => exportToPDF(funcionarios)}
								onDataImported={() => {
									// Forçar atualização da interface de qualidade
									console.log('✅ Dados de qualidade importados, forçando atualização da interface...');
									// Disparar evento customizado para atualizar o módulo de qualidade
									window.dispatchEvent(new CustomEvent('qualidadeDataUpdated', { 
										detail: { timestamp: new Date().toISOString() } 
									}));
								}}
							/>
						</div>

						<div className="bg-white rounded-lg shadow-sm border border-gray-200">
							<QualidadeModule />
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default App;