import { Package, Truck, User, BarChart3, ShoppingCart, PackagePlus, SendHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link'; 

export default function Home() {
    const features = [
        {
            title: 'Caminhões',
            description: 'Gerencie sua frota de caminhões',
            icon: Truck,
            link: '/trucks',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Motoristas',
            description: 'Controle de motoristas e CNHs',
            icon: User,
            link: '/drivers',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Inventário',
            description: 'Acompanhe itens de estoque',
            icon: Package,
            link: '/inventory',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: 'Entradas de Materiais',
            description: 'Registre entradas de materiais',
            icon: PackagePlus,
            link: '/inbound-entries',
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50',
        },
        {
            title: 'Pedidos',
            description: 'Gerencie pedidos de clientes',
            icon: ShoppingCart,
            link: '/orders',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            title: 'Expedições',
            description: 'Coordene entregas e expedições',
            icon: SendHorizontal,
            link: '/expeditions',
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl mb-2">Dashboard</h1>
                <p className="text-gray-600">Bem-vindo ao Sistema de Gestão de Estoque</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-blue-600" />
                        <div>
                            <CardTitle>Sistema de Gestão de Estoque e Logística</CardTitle>
                            <CardDescription>
                                Plataforma completa para gerenciamento operacional
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-700">
                        Este sistema foi desenvolvido para otimizar e centralizar o gerenciamento de operações 
                        logísticas e de estoque. Com ele, você pode:
                    </p>
                    
                    <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>
                                <strong>Gerenciar Caminhões:</strong> Controle completo da frota, incluindo 
                                capacidade, disponibilidade e informações de cada veículo.
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>
                                <strong>Administrar Motoristas:</strong> Cadastro de motoristas com validação 
                                de CNH, categorias habilitadas e status de disponibilidade.
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>
                                <strong>Controlar Inventário:</strong> Gestão de itens de estoque com rastreamento 
                                de quantidades disponíveis e preços.
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>
                                <strong>Registrar Entradas de Materiais:</strong> Controle de entrada de materiais 
                                no estoque com rastreamento de fornecedores e referências.
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>
                                <strong>Gerenciar Pedidos:</strong> Criação e acompanhamento de pedidos vinculados 
                                aos itens de estoque.
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>
                                <strong>Coordenar Expedições:</strong> Planejamento de expedições conectando 
                                motoristas, caminhões e pedidos para entregas eficientes.
                            </span>
                        </li>
                    </ul>

                    <p className="text-gray-700">
                        Com interface intuitiva e recursos avançados de filtragem por data, o sistema 
                        garante que você tenha total visibilidade e controle sobre todas as operações, 
                        desde a entrada de materiais até a expedição final.
                    </p>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        // O Next.js usa 'href' em vez de 'to'
                        <Link key={feature.title} href={feature.link}> 
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-2`}>
                                        <Icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                    <CardTitle>{feature.title}</CardTitle>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}