from app.schemas.response import PageDetails


def resolve_paging(page: PageDetails | None = None) -> tuple[int, int]:
    page = PageDetails(index=1, size=10) if page is None else page

    return [page.size, (page.index - 1) * page.size]
