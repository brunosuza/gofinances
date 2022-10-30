import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';
import theme from '../../global/styles/theme';
import { useAuth } from '../../hooks/auth';

import {
    Container, 
    Header,
    UserWrapper,
    UserInfo,
    Photo,
    User,
    UserGreeting,
    UserName,
    Icon,
    HighlightCards,
    Transactions,
    Title,
    TransactionList,
    LoadContainer,
    LogoutButton
 } from './styles'
import { Alert } from 'react-native';

 export interface DataListProps extends TransactionCardProps {
    id: string;
 }

 interface HighlightProps {
    amount: string;
    lastTransaction: string;
 }

 interface HightlightData {
    entries: HighlightProps;
    expensives: HighlightProps;
    total: HighlightProps;
 }

export function Dashboard() {
    const dataKey = '@gofinances:transactions';
    const dataKeyUser = '@gofinances:user';

    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<DataListProps[]>([]);
    const [higtLightData, setHigtLightData] = useState<HightlightData>({} as HightlightData);

    const theme = useTheme();
    const { signOut, user } = useAuth();

    async function removeAll() {
        await AsyncStorage.removeItem(dataKey);
    }

    async function removeAllUser() {
        await AsyncStorage.removeItem(dataKeyUser);
    }

    function getLastTransactionDate(collection: DataListProps[], type: 'positive' | 'negative') {
        const collectionFiltered = collection.filter(transaction => transaction.type === type);
        
        if (collectionFiltered.length === 0) {
            return 0;
        }

        const lastTransation = new Date(Math.max.apply(Math, collectionFiltered
            .map(transaction => new Date(transaction.date).getTime())));
    
        return `${lastTransation.getDate()} de ${lastTransation.toLocaleString('pt-BR', { month : 'long'})}`;
    }

    async function loadTransactions() {
        const dataKey = `@gofinances:transactions_user:${user.id}`;
        let entriesTotal = 0;
        let expensiveTotal = 0;
        
        const response = await AsyncStorage.getItem(dataKey);
        const transactions = response ? JSON.parse(response) : [];
        
        const transactionsFormatted: DataListProps[] = transactions.map((item: DataListProps) => {
            if (item.type === 'positive') {
                entriesTotal += Number(item.amount);
            } else if (item.type === 'negative') {
                expensiveTotal += Number(item.amount);
            }

            const amount = Number(item.amount).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
            
            const date = Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            }).format(new Date(item.date));

            return {
                id: item.id,
                name: item.name,
                amount,
                type: item.type,
                category: item.category,
                date, 
            }

        });
        setTransactions(transactionsFormatted);

        const lastTransactionEntries = getLastTransactionDate(transactions, 'positive');
        const lastTransactionExpensives = getLastTransactionDate(transactions, 'negative');
        const totalInterval = lastTransactionEntries === 0 
        ? 'Não há transações' 
        : `01 a ${lastTransactionExpensives}`;

        const total = entriesTotal - expensiveTotal;

        setHigtLightData({
            entries: {
                amount: entriesTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: lastTransactionEntries === 0 
                ? 'Não há transações' 
                : `Última entrada dia ${lastTransactionEntries}`,
            },
            expensives: {
                amount: expensiveTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: lastTransactionEntries === 0 
                ? 'Não há transações' 
                : `Última saída dia ${lastTransactionExpensives}`,
            },
            total: {
                amount: total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: totalInterval,
            }
        });
    }

    useEffect(() => {
        loadTransactions();
        setIsLoading(false);
    }, []);

    useFocusEffect(useCallback(() => {
        //removeAll(); 
        //removeAllUser();
        loadTransactions();
    }, []));

    return (
        <Container>
            {
                isLoading ? <LoadContainer>
                                <ActivityIndicator 
                                    color={theme.colors.primary}
                                    size='large'
                                 />
                            </LoadContainer> :
                <>
                <Header>
                    <UserWrapper>
                        <UserInfo>
                            <Photo source={{ uri: user.photo}} />
                            <User>
                                <UserGreeting>Olá</UserGreeting>
                                <UserName>{user.name}</UserName>
                            </User>
                        </UserInfo>

                        <LogoutButton onPress={signOut}>
                            <Icon name='power' />
                        </LogoutButton>
                    
                    </UserWrapper>
                </Header>
                <HighlightCards>
                    <HighlightCard
                        type='up'
                        title='Entradas' 
                        amount={higtLightData?.entries?.amount}
                        lastTransaction={higtLightData?.entries?.lastTransaction} />
                    <HighlightCard
                        type='down'
                        title='Saídas' 
                        amount={higtLightData?.expensives?.amount}
                        lastTransaction={higtLightData?.expensives?.lastTransaction} />
                    <HighlightCard
                        type='total'
                        title='Total' 
                        amount={higtLightData?.total?.amount}
                        lastTransaction={higtLightData?.total?.lastTransaction} />
                </HighlightCards>

                <Transactions>
                    <Title>Listagem</Title>
                    <TransactionList 
                        data={transactions}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => <TransactionCard data={item} />}
                    />
                </Transactions>
            </>
            }
        </Container>
    );
}
