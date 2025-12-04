import redis
from crewai.memory.external.external_memory import ExternalMemory
from crewai.memory.storage.interface import Storage

class RedisStorage(Storage):
    def __init__(self, host='localhost', port=6379, db=0):
        self.redis_client = redis.Redis(host=host, port=port, db=db, decode_responses=True)
        self.reset()
    
    def save(self, value, metadata=None, agent=None):
        import json
        key = f"memory:{hash(str(value))}"
        self.redis_client.set(key, json.dumps({
            "value": value,
            "metadata": metadata,
            "agent": agent
        }))
    
    def search(self, query, limit=10, score_threshold=0.5):
        import json
        results = []
        for key in self.redis_client.scan_iter("memory:*"):
            data = json.loads(self.redis_client.get(key))
            if query.lower() in str(data["value"]).lower():
                results.append(data)
        return results[:limit]
    
    def reset(self):
        for key in self.redis_client.scan_iter("memory:*"):
            self.redis_client.delete(key)