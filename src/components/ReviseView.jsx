import { useMemo, useState } from 'react'
import { Input, Table, Typography } from 'antd'
import { getWordsBySubcategory } from '../data/vocab'

const { Title, Text } = Typography

export default function ReviseView({ subcategory }) {
  const [search, setSearch] = useState('')
  const words = useMemo(
    () => getWordsBySubcategory(subcategory),
    [subcategory],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return words
    return words.filter(
      (w) =>
        w.german.toLowerCase().includes(q) ||
        w.english.toLowerCase().includes(q),
    )
  }, [words, search])

  const columns = [
    {
      title: 'German',
      dataIndex: 'german',
      key: 'german',
      sorter: (a, b) => a.german.localeCompare(b.german),
    },
    {
      title: 'English',
      dataIndex: 'english',
      key: 'english',
      sorter: (a, b) => a.english.localeCompare(b.english),
    },
  ]

  return (
    <div className="revise-view">
      <div className="revise-header">
        <div>
          <Title level={4}>{subcategory}</Title>
          <Text type="secondary">{filtered.length} words</Text>
        </div>
        <Input.Search
          className="revise-search"
          placeholder="Search German or English"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Table
        rowKey={(row) => `${row.german}-${row.english}`}
        columns={columns}
        dataSource={filtered}
        pagination={false}
        size="middle"
      />
    </div>
  )
}
