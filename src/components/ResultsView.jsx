import { Button, List, Space, Statistic, Tag, Typography } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function ResultsView({
  correct,
  total,
  wrong,
  onRetry,
  onChangeTheme,
}) {
  const wrongCount = total - correct
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100)

  return (
    <div className="results-view">
      <Title level={3}>Results</Title>
      <div className="results-stats">
        <Statistic title="Correct" value={correct} />
        <Statistic title="Wrong" value={wrongCount} />
        <Statistic title="Accuracy" value={percent} suffix="%" />
      </div>

      {wrong.length > 0 ? (
        <>
          <Title level={5}>Missed words</Title>
          <List
            bordered
            dataSource={wrong}
            renderItem={(item) => (
              <List.Item>
                <Space direction="vertical" size={0}>
                  <Text>
                    <CloseCircleOutlined className="miss-icon" /> {item.prompt}
                    {item.skipped ? (
                      <>
                        {' '}
                        <Tag>Skipped</Tag>
                      </>
                    ) : (
                      <>
                        {' '}
                        →{' '}
                        <Text delete type="secondary">
                          {item.given}
                        </Text>
                      </>
                    )}
                  </Text>
                  <Text type="success">
                    <CheckCircleOutlined /> {item.expected}
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        </>
      ) : (
        <Text type="success">Perfect score — no missed words.</Text>
      )}

      <Space className="results-actions">
        <Button type="primary" size="large" onClick={onRetry}>
          Retry
        </Button>
        <Button size="large" onClick={onChangeTheme}>
          Change theme
        </Button>
      </Space>
    </div>
  )
}
