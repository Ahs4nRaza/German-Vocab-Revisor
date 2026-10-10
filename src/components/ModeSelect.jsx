import { Segmented } from 'antd'
import { BookOutlined, FormOutlined } from '@ant-design/icons'

export default function ModeSelect({ value, onChange }) {
  return (
    <Segmented
      block
      size="large"
      value={value}
      onChange={onChange}
      options={[
        {
          label: 'Revise',
          value: 'revise',
          icon: <BookOutlined />,
        },
        {
          label: 'Practice',
          value: 'practice',
          icon: <FormOutlined />,
        },
      ]}
    />
  )
}
