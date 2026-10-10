import { Button, Radio, Space, Switch, Typography } from 'antd'

const { Title, Text } = Typography

export default function PracticeSetup({
  subcategory,
  direction,
  format,
  immediateFeedback,
  onDirectionChange,
  onFormatChange,
  onImmediateFeedbackChange,
  onStart,
}) {
  return (
    <div className="practice-setup">
      <Title level={4}>Practice: {subcategory}</Title>
      <Text type="secondary">Choose direction and answer format, then start.</Text>

      <div className="setup-field">
        <Text strong>Direction</Text>
        <Radio.Group
          value={direction}
          onChange={(e) => onDirectionChange(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          options={[
            { label: 'German → English', value: 'de-en' },
            { label: 'English → German', value: 'en-de' },
          ]}
        />
      </div>

      <div className="setup-field">
        <Text strong>Format</Text>
        <Radio.Group
          value={format}
          onChange={(e) => onFormatChange(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          options={[
            { label: 'Typed', value: 'typed' },
            { label: 'Multiple choice', value: 'mcq' },
          ]}
        />
      </div>

      <div className="setup-field">
        <Text strong>Immediate feedback</Text>
        <div className="feedback-toggle">
          <Switch
            checked={immediateFeedback}
            onChange={onImmediateFeedbackChange}
          />
          <Text type="secondary">
            {immediateFeedback
              ? 'Show correct/incorrect after each answer'
              : 'Reveal results only at the end'}
          </Text>
        </div>
      </div>

      <Space>
        <Button type="primary" size="large" onClick={onStart}>
          Start quiz
        </Button>
      </Space>
    </div>
  )
}
