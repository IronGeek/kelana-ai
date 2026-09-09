from uuid import UUID

from shortuuid import (
    decode,
    encode,
)


def from_uuid(str: UUID | str) -> str:
    return encode(str if isinstance(str, UUID) else UUID(str))


def to_uuid(str: str) -> UUID:
    return decode(str)
