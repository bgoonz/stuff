//  Copyright (c) 2011-present, Facebook, Inc.  All rights reserved.
//  This source code is licensed under both the GPLv2 (found in the
//  COPYING file in the root directory) and Apache 2.0 License
//  (found in the LICENSE.Apache file in the root directory).

#include "rocksdb/trace_record.h"

#include <utility>

#include "rocksdb/db.h"
#include "rocksdb/iterator.h"
#include "rocksdb/options.h"
#include "rocksdb/status.h"
#include "trace_replay/trace_record_handler.h"

namespace ROCKSDB_NAMESPACE {

// TraceRecord
TraceRecord::TraceRecord(uint64_t timestamp) : timestamp_(timestamp) {}

TraceRecord::~TraceRecord() {}

uint64_t TraceRecord::GetTimestamp() const { return timestamp_; }

TraceRecord::Handler* TraceRecord::NewExecutionHandler(
    DB* db, const std::vector<ColumnFamilyHandle*>& handles) {
  return new TraceExecutionHandler(db, handles);
}

// QueryTraceRecord
QueryTraceRecord::QueryTraceRecord(uint64_t timestamp)
    : TraceRecord(timestamp) {}

QueryTraceRecord::~QueryTraceRecord() {}

// WriteQueryTraceRecord
WriteQueryTraceRecord::WriteQueryTraceRecord(PinnableSlice&& write_batch_rep,
                                             uint64_t timestamp)
    : QueryTraceRecord(timestamp), rep_(std::move(write_batch_rep)) {}

WriteQueryTraceRecord::WriteQueryTraceRecord(const std::string& write_batch_rep,
                                             uint64_t timestamp)
    : QueryTraceRecord(timestamp) {
  rep_.PinSelf(write_batch_rep);
}

WriteQueryTraceRecord::~WriteQueryTraceRecord() {}

Slice WriteQueryTraceRecord::GetWriteBatchRep() const { return Slice(rep_); }

Status WriteQueryTraceRecord::Accept(Handler* handler) {
  assert(handler != nullptr);
  return handler->Handle(*this);
}

// GetQueryTraceRecord
GetQueryTraceRecord::GetQueryTraceRecord(uint32_t column_family_id,
                                         PinnableSlice&& key,
                                         uint64_t timestamp)
    : QueryTraceRecord(timestamp),
      cf_id_(column_family_id),
      key_(std::move(key)) {}

GetQueryTraceRecord::GetQueryTraceRecord(uint32_t column_family_id,
                                         const std::string& key,
                                         uint64_t timestamp)
    : QueryTraceRecord(timestamp), cf_id_(column_family_id) {
  key_.PinSelf(key);
}

GetQueryTraceRecord::~GetQueryTraceRecord() {}

uint32_t GetQueryTraceRecord::GetColumnFamilyID() const { return cf_id_; }

Slice GetQueryTraceRecord::GetKey() const { return Slice(key_); }

Status GetQueryTraceRecord::Accept(Handler* handler) {
  assert(handler != nullptr);
  return handler->Handle(*this);
}

// IteratorQueryTraceRecord
IteratorQueryTraceRecord::IteratorQueryTraceRecord(uint64_t timestamp)
    : QueryTraceRecord(timestamp) {}

IteratorQueryTraceRecord::~IteratorQueryTraceRecord() {}

// IteratorSeekQueryTraceRecord
IteratorSeekQueryTraceRecord::IteratorSeekQueryTraceRecord(
    SeekType seek_type, uint32_t column_family_id, PinnableSlice&& key,
    uint64_t timestamp)
    : IteratorQueryTraceRecord(timestamp),
      type_(seek_type),
      cf_id_(column_family_id),
      key_(std::move(key)) {}

IteratorSeekQueryTraceRecord::IteratorSeekQueryTraceRecord(
    SeekType seek_type, uint32_t column_family_id, const std::string& key,
    uint64_t timestamp)
    : IteratorQueryTraceRecord(timestamp),
      type_(seek_type),
      cf_id_(column_family_id) {
  key_.PinSelf(key);
}

IteratorSeekQueryTraceRecord::~IteratorSeekQueryTraceRecord() {}

TraceType IteratorSeekQueryTraceRecord::GetTraceType() const {
  return static_cast<TraceType>(type_);
}

IteratorSeekQueryTraceRecord::SeekType
IteratorSeekQueryTraceRecord::GetSeekType() const {
  return type_;
}

uint32_t IteratorSeekQueryTraceRecord::GetColumnFamilyID() const {
  return cf_id_;
}

Slice IteratorSeekQueryTraceRecord::GetKey() const { return Slice(key_); }

Status IteratorSeekQueryTraceRecord::Accept(Handler* handler) {
  assert(handler != nullptr);
  return handler->Handle(*this);
}

// MultiGetQueryTraceRecord
MultiGetQueryTraceRecord::MultiGetQueryTraceRecord(
    std::vector<uint32_t> column_family_ids, std::vector<PinnableSlice>&& keys,
    uint64_t timestamp)
    : QueryTraceRecord(timestamp),
      cf_ids_(column_family_ids),
      keys_(std::move(keys)) {}

MultiGetQueryTraceRecord::MultiGetQueryTraceRecord(
    std::vector<uint32_t> column_family_ids,
    const std::vector<std::string>& keys, uint64_t timestamp)
    : QueryTraceRecord(timestamp), cf_ids_(column_family_ids) {
  keys_.reserve(keys.size());
  for (const std::string& key : keys) {
    PinnableSlice ps;
    ps.PinSelf(key);
    keys_.push_back(std::move(ps));
  }
}

MultiGetQueryTraceRecord::~MultiGetQueryTraceRecord() {}

std::vector<uint32_t> MultiGetQueryTraceRecord::GetColumnFamilyIDs() const {
  return cf_ids_;
}

std::vector<Slice> MultiGetQueryTraceRecord::GetKeys() const {
  return std::vector<Slice>(keys_.begin(), keys_.end());
}

Status MultiGetQueryTraceRecord::Accept(Handler* handler) {
  assert(handler != nullptr);
  return handler->Handle(*this);
}

}  // namespace ROCKSDB_NAMESPACE
