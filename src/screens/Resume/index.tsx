import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VictoryPie } from 'victory-native';
import { HistoryCard } from '../../components/HistoryCard';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import {
    Container,
    Header,
    Title,
    Content,
    ChartContainer,
    MonthSelect,
    MonthSelectIcon,
    Month,
    LoadContainer
} from './styles';

import { categories } from '../../utils/categories';
import { RFValue } from 'react-native-responsive-fontsize';
import theme from '../../global/styles/theme';
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/auth';

interface TransactionData {
    type: 'positive' | 'negative';
    name: string;
    amount: string;
    category: string;
    date: string;
}

interface CategoryData {
    key: string;
    name: string;
    total: number;
    totalFormatted: string;
    color: string;
    percent: string;
}

export function Resume() {

    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [totalByCategories, setTotalByCategories] = useState<CategoryData>([]);

    async function loadData() {
       
        setIsLoading(true);
        const dataKey = `@gofinances:transactions_user:${user.id}`;
        const response = await AsyncStorage.getItem(dataKey);
        const responseFormatted = response ? JSON.parse(response) : [];
        console.log(responseFormatted);
        const expenses = responseFormatted.filter(
            (expense: TransactionData) =>
              expense.type === 'negative' &&
              new Date(expense.date).getMonth() === selectedDate.getMonth() &&
              new Date(expense.date).getFullYear() === selectedDate.getFullYear()
          );
      
          const expensesTotal = expenses.reduce(
            (accumulator: number, expense: TransactionData) => {
              return accumulator + Number(expense.amount);
            },
            0
          );
      
          const totalByCategory: CategoryData[] = [];
      
          categories.forEach((category) => {
            let categorySum = 0;
            expenses.forEach((expense: TransactionData) => {
              if (expense.category === category.key) {
                categorySum += Number(expense.amount);
              }
            });
      
            if (categorySum > 0) {
              const totalFormatted = categorySum.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              });
      
              const percent = `${((categorySum / expensesTotal) * 100).toFixed(0)}%`;
      
              totalByCategory.push({
                key: category.key,
                name: category.name,
                color: category.color,
                total: categorySum,
                totalFormatted,
                percent,
              });
            }
          });
    
          setTotalByCategories(totalByCategory);
      
          setIsLoading(false);
    }

    function handleDateChange(action: 'next' | 'prev') {
        if (action === 'next') {
            setSelectedDate(addMonths(selectedDate, 1));
        } else {
            setSelectedDate(subMonths(selectedDate, 1));
        }
    }

    useFocusEffect(useCallback(() => {
        loadData();
    }, [selectedDate]));

    return(
        <Container>
            <Header>
                <Title>
                    Resumo por categoria
                </Title>
            </Header>
            {
                isLoading ? <LoadContainer>
                                <ActivityIndicator 
                                    color={theme.colors.primary}
                                    size='large'
                                 />
                            </LoadContainer> :
            <Content
                showVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: useBottomTabBarHeight()
                }}
            >
                <MonthSelect>
                   <MonthSelectIcon 
                        onPress={() => handleDateChange('prev')}
                        name="chevron-left" 
                    />

                    <Month>
                        {format(selectedDate, 'MMMM, yyy', { locale: ptBR })}
                    </Month>

                    <MonthSelectIcon
                        onPress={() => handleDateChange('next')}
                        name="chevron-right"
                    />
                    
                </MonthSelect>

                <ChartContainer>
                    <VictoryPie
                        data={totalByCategories}
                        colorScale={totalByCategories.map(category => category.color)}
                        style={{
                            labels: {
                                fontSize: RFValue(18),
                                fontWeight: 'bold',
                                fill: theme.colors.shape
                            }
                        }}
                        labelRadius={50}
                        x='percent'
                        y='total'
                    />
                </ChartContainer>
            {
                totalByCategories.map(item => (
                    <HistoryCard
                        key={item.key}
                        title={item.name}
                        amount={item.totalFormatted}
                        color={item.color}
                    />
                ))
            }
            </Content>
            }
        </Container>
    );
}