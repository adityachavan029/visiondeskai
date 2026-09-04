import importlib
import unittest


class DatabaseConfigFallbackTest(unittest.TestCase):
    def test_database_falls_back_to_sqlite_when_env_missing(self):
        import os

        os.environ.pop("DATABASE_URL", None)
        import database

        importlib.reload(database)

        self.assertTrue(str(database.DATABASE_URL).startswith("sqlite"))
        self.assertTrue(str(database.engine.url).startswith("sqlite"))


if __name__ == "__main__":
    unittest.main()
