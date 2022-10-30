import React, { useContext, useState } from 'react';
import AppleSvg from '../../assets/apple.svg';
import GoogleSvg from '../../assets/google.svg';
import LogoSvg from '../../assets/logo.svg';
import {Text, View, Image, Platform, ActivityIndicator} from "react-native";
import { useAuth } from '../../hooks/auth';

import { 
    Container,
    Header,
    TitleWrapper,
    Title,
    SignInTitle,
    Footer,
    FooterWrapper
 } from './styles';

import { SignInSocialButton } from '../../components/SignInSocialButton';
import { Button } from '../../components/Forms/Button';
import { useTheme } from 'styled-components';

export function SignIn() {
    const [isLoading, setIsLoading] = useState(false);
    const { signInWithGoogle, signInWithApple } = useAuth();
    const theme = useTheme();

    async function handleSignInWithGoogle() {
        try {
           setIsLoading(true);
           return await signInWithGoogle();
        } catch (error) {
            setIsLoading(false);
        } 
    }

    async function handleSignInWithApple() {
        try {
            setIsLoading(true);
            return await handleSignInWithApple();
        } catch (error) {
            setIsLoading(false);
        }
    }
    
    return(
        <Container>
            <Header>
            <TitleWrapper>
                    <Image source={require('../../assets/logo.svg')}/>
       

                    <Title>
                        Controle suas {'\n'}finanças de forma {'\n'}muito simples
                    </Title>
                </TitleWrapper>

                <SignInTitle>
                    Faça seu login com {'\n'}uma das contas abaixo
                </SignInTitle>
            </Header>

            <Footer>
                <FooterWrapper>
                    <SignInSocialButton
                     title='Entrar com Google'
                     onPress={handleSignInWithGoogle}
                    />
                    {   Platform.OS === 'ios' &&
                        <SignInSocialButton
                            title='Entrar com Apple'
                            onPress={handleSignInWithApple}
                            //  svg={AppleSvg}
                        />
                    }
                </FooterWrapper>

            { isLoading && (
                <ActivityIndicator
                    color={theme.colors.shape}
                    style={{ marginTop: 18 }}
                /> 
            )}
            </Footer>
        </Container>
    );
}