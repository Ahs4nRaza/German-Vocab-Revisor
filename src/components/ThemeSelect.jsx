import { Select } from 'antd'
import { getSubcategorySelectOptions } from '../data/vocab'

export default function ThemeSelect({ value, onChange }) {
  return (
    <Select
      className="theme-select"
      showSearch
      placeholder="Select a subcategory"
      optionFilterProp="label"
      options={getSubcategorySelectOptions()}
      value={value}
      onChange={onChange}
      size="large"
    />
  )
}
