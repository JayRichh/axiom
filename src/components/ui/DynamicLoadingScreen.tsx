import styled from 'styled-components'

export function DynamicLoadingScreen() {
  return (
    <Text>
      <Line>Loading...</Line>
    </Text>
  )
}

const Text = styled.div`
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  padding: 10px;
`

const Line = styled.span`
  font-size: 24px;
  display: block;
  line-height: 32px;
`
